"use server";

import { createServerClient } from "@/lib/supabase/createServerClient";
import { revalidatePath } from "next/cache";

type ActionState = { error: string | null; success: boolean };

async function getActor() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, firm_id, name, role")
    .eq("id", user.id)
    .single();
  if (profileError) console.error("[getActor] profile fetch:", profileError);

  return profile ? { supabase, user, profile } : null;
}

// ─── Get Signed URL (STAFF + REVIEWER) ──────────────────────────────────────

export async function getDocumentUrl(
  filePath: string,
): Promise<{ url: string | null; error: string | null }> {
  const ctx = await getActor();
  if (!ctx) return { url: null, error: "Not authenticated." };
  const { supabase } = ctx;

  const { data, error } = await supabase.storage
    .from("audit-docs")
    .createSignedUrl(filePath, 3600);

  if (error) {
    console.error("[getDocumentUrl] signed URL:", error);
    return { url: null, error: error.message };
  }

  return { url: data.signedUrl, error: null };
}

// ─── Upload Document (STAFF only) ────────────────────────────────────────────

export async function uploadDocument(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await getActor();
  if (!ctx) return { error: "Not authenticated.", success: false };
  const { supabase, user, profile } = ctx;

  if (profile.role !== "STAFF") {
    return { error: "Only staff members can upload documents.", success: false };
  }

  const documentId = String(formData.get("document_id") ?? "").trim();
  const clientId = String(formData.get("client_id") ?? "").trim();
  const clientName = String(formData.get("client_name") ?? "").trim();
  const docName = String(formData.get("doc_name") ?? "").trim();
  const currentStatus = String(formData.get("current_status") ?? "").trim();
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return { error: "Please select a PDF file to upload.", success: false };
  }
  if (file.type !== "application/pdf") {
    return { error: "Only PDF files are accepted.", success: false };
  }

  const allowedStatuses = ["PENDING", "CORRECTION_REQUIRED"];
  if (!allowedStatuses.includes(currentStatus)) {
    return { error: "This document cannot be uploaded in its current state.", success: false };
  }

  const storagePath = `${profile.firm_id}/${clientId}/${documentId}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("audit-docs")
    .upload(storagePath, file, { upsert: true, contentType: "application/pdf" });

  if (uploadError) {
    console.error("[uploadDocument] storage upload:", uploadError);
    return { error: uploadError.message, success: false };
  }

  const newStatus = currentStatus === "CORRECTION_REQUIRED" ? "UPLOADED_AGAIN" : "UPLOADED";
  const { error: updateError } = await supabase
    .from("documents")
    .update({
      status: newStatus,
      file_path: storagePath,
      uploaded_by_id: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId)
    .eq("firm_id", profile.firm_id);

  if (updateError) {
    console.error("[uploadDocument] document update:", updateError);
    return { error: updateError.message, success: false };
  }

  const action = newStatus === "UPLOADED_AGAIN" ? "DOC_UPLOADED_AGAIN" : "DOC_UPLOADED";
  await supabase.from("audit_logs").insert({
    firm_id: profile.firm_id,
    user_id: user.id,
    client_id: clientId,
    client_name: clientName,
    document_id: documentId,
    document_name: docName,
    action,
  });

  revalidatePath(`/dashboard/client/${clientId}`);
  return { error: null, success: true };
}

// ─── Review Document (REVIEWER only) ─────────────────────────────────────────

const REVIEW_TRANSITIONS: Record<string, string[]> = {
  UPLOADED: ["UNDER_REVIEW"],
  UPLOADED_AGAIN: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["APPROVED", "CORRECTION_REQUIRED"],
};

const ACTION_MAP: Record<string, string> = {
  UNDER_REVIEW: "DOC_REVIEW_STARTED",
  APPROVED: "DOC_APPROVED",
  CORRECTION_REQUIRED: "DOC_CORRECTION_REQUIRED",
};

export async function reviewDocument(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await getActor();
  if (!ctx) return { error: "Not authenticated.", success: false };
  const { supabase, user, profile } = ctx;

  if (profile.role !== "REVIEWER") {
    return { error: "Only reviewers can perform review actions.", success: false };
  }

  const documentId = String(formData.get("document_id") ?? "").trim();
  const clientId = String(formData.get("client_id") ?? "").trim();
  const clientName = String(formData.get("client_name") ?? "").trim();
  const docName = String(formData.get("doc_name") ?? "").trim();
  const currentStatus = String(formData.get("current_status") ?? "").trim();
  const newStatus = String(formData.get("new_status") ?? "").trim();
  const comment = String(formData.get("comment") ?? "").trim();

  const allowed = REVIEW_TRANSITIONS[currentStatus] ?? [];
  if (!allowed.includes(newStatus)) {
    return { error: `Cannot transition from ${currentStatus} to ${newStatus}.`, success: false };
  }

  if (newStatus === "CORRECTION_REQUIRED" && !comment) {
    return { error: "A comment is required when requesting corrections.", success: false };
  }

  const { error: updateError } = await supabase
    .from("documents")
    .update({
      status: newStatus,
      latest_comment: comment || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId)
    .eq("firm_id", profile.firm_id);

  if (updateError) {
    console.error("[reviewDocument] document update:", updateError);
    return { error: updateError.message, success: false };
  }

  await supabase.from("audit_logs").insert({
    firm_id: profile.firm_id,
    user_id: user.id,
    client_id: clientId,
    client_name: clientName,
    document_id: documentId,
    document_name: docName,
    action: ACTION_MAP[newStatus],
    comment: comment || null,
  });

  revalidatePath(`/dashboard/client/${clientId}`);
  return { error: null, success: true };
}
