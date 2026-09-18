import { createServerClient } from "@/lib/supabase/createServerClient";
import { ClipboardCheck, FileText, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { SidebarProfile } from "./sidebar-profile";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role, custom_emp_id")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      <aside className="flex w-56 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-14 items-center gap-2.5 border-b border-zinc-200 px-4 dark:border-zinc-800">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
            <ClipboardCheck className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            CA Audit
          </span>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Users className="h-4 w-4 shrink-0" />
            Clients
          </Link>
          <Link
            href="/dashboard/audit-logs"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <FileText className="h-4 w-4 shrink-0" />
            Audit Logs
          </Link>
        </nav>

        {profile && (
          <SidebarProfile
            name={profile.name}
            role={profile.role}
            customEmpId={profile.custom_emp_id}
          />
        )}
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
