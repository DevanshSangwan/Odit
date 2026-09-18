"use server";

import { createServerClient } from "@/lib/supabase/createServerClient";
import { redirect } from "next/navigation";

export type AuthActionState = {
  error: string | null;
};

const FIRM_CODES = {
  "1": "A",
  "2": "B",
  "3": "C",
} as const;

const ROLES = ["STAFF", "REVIEWER"] as const;

type FirmId = keyof typeof FIRM_CODES;
type Role = (typeof ROLES)[number];

function isFirmId(value: string): value is FirmId {
  return value in FIRM_CODES;
}

function isRole(value: string): value is Role {
  return ROLES.includes(value as Role);
}

export async function signup(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "");
  const firmId = String(formData.get("firm_id") ?? "");

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required." };
  }

  if (!isRole(role)) {
    return { error: "Select a valid role." };
  }

  if (!isFirmId(firmId)) {
    return { error: "Firm ID must be 1, 2, or 3." };
  }

  const supabase = await createServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
        firm_id: firmId,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  const user = data.user;
  if (!user) {
    return { error: "Signup succeeded but no user was returned." };
  }

  const customEmpId = await nextCustomEmpId(supabase, firmId, role);

  const { error: profileError } = await supabase.from("profiles").insert({
    id: user.id,
    firm_id: firmId,
    custom_emp_id: customEmpId,
    name,
    email,
    role,
  });

  if (profileError) {
    return { error: profileError.message };
  }

  redirect("/dashboard");
}

export async function signOut(): Promise<never> {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function login(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

async function nextCustomEmpId(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  firmId: FirmId,
  role: Role,
) {
  const prefix = `${FIRM_CODES[firmId]}${role === "REVIEWER" ? "R" : "S"}`;

  const { data } = await supabase
    .from("profiles")
    .select("custom_emp_id")
    .eq("firm_id", firmId)
    .eq("role", role);

  let max = 0;
  for (const row of data ?? []) {
    const n = Number(String(row.custom_emp_id).slice(prefix.length));
    if (!Number.isNaN(n) && n > max) {
      max = n;
    }
  }

  return `${prefix}${max + 1}`;
}
