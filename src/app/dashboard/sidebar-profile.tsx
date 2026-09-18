"use client";

import { signOut } from "@/app/auth/actions";
import { LogOut } from "lucide-react";
import { useTransition } from "react";

const roleBadgeClass: Record<string, string> = {
  STAFF:
    "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
  REVIEWER:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
};

export function SidebarProfile({
  name,
  role,
  customEmpId,
}: {
  name: string;
  role: string;
  customEmpId: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
      <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60">
        <div className="mb-2 flex items-start justify-between gap-2">
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {name}
          </p>
          <span
            className={`shrink-0 rounded-md px-1.5 py-0.5 text-xs font-semibold ${roleBadgeClass[role] ?? ""}`}
          >
            {role}
          </span>
        </div>
        <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
          ID: {customEmpId}
        </p>
        <button
          onClick={() => startTransition(() => signOut())}
          disabled={pending}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <LogOut className="h-3.5 w-3.5" />
          {pending ? "Signing out…" : "Sign Out"}
        </button>
      </div>
    </div>
  );
}
