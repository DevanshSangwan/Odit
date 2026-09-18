"use server";

import { createServerClient } from "@/lib/supabase/createServerClient";
import { revalidatePath } from "next/cache";

export type CreateClientState = { error: string | null; success: boolean };

export async function createClient(
  _prev: CreateClientState,
  formData: FormData,
): Promise<CreateClientState> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated.", success: false };

  const { data: actor } = await supabase
    .from("profiles")
    .select("firm_id, name")
    .eq("id", user.id)
    .single();
  if (!actor) return { error: "Profile not found.", success: false };

  const clientName = String(formData.get("client_name") ?? "").trim();
  const staffEmpId = String(formData.get("staff_emp_id") ?? "").trim();
  const reviewerEmpId = String(formData.get("reviewer_emp_id") ?? "").trim();
  const docNames = formData
    .getAll("doc_names[]")
    .map((d) => String(d).trim())
    .filter(Boolean);

  if (!clientName || !staffEmpId || !reviewerEmpId) {
    return { error: "Client name, Staff ID, and Reviewer ID are required.", success: false };
  }
  if (docNames.length === 0) {
    return { error: "Add at least one required document.", success: false };
  }

  // Resolve custom_emp_ids → UUIDs, scoped to the actor's firm
  const { data: staffProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("custom_emp_id", staffEmpId)
    .eq("firm_id", actor.firm_id)
    .single();
  if (!staffProfile) {
    return { error: `No staff member found with ID "${staffEmpId}" in your firm.`, success: false };
  }

  const { data: reviewerProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("custom_emp_id", reviewerEmpId)
    .eq("firm_id", actor.firm_id)
    .single();
  if (!reviewerProfile) {
    return { error: `No reviewer found with ID "${reviewerEmpId}" in your firm.`, success: false };
  }

  // Insert client
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert({
      firm_id: actor.firm_id,
      name: clientName,
      assigned_staff_id: staffProfile.id,
      assigned_reviewer_id: reviewerProfile.id,
    })
    .select("id")
    .single();

  if (clientError || !client) {
    return { error: clientError?.message ?? "Failed to create client.", success: false };
  }

  // Insert documents with PENDING status
  const { error: docsError } = await supabase.from("documents").insert(
    docNames.map((doc_name) => ({
      firm_id: actor.firm_id,
      client_id: client.id,
      doc_name,
      status: "PENDING",
    })),
  );
  if (docsError) {
    return { error: docsError.message, success: false };
  }

  // Insert audit log
  await supabase.from("audit_logs").insert({
    firm_id: actor.firm_id,
    user_id: user.id,
    client_id: client.id,
    client_name: clientName,
    action: "CLIENT_CREATED",
  });

  revalidatePath("/dashboard");
  return { error: null, success: true };
}
