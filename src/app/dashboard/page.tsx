import { CreateClientModal } from "@/app/dashboard/create-client-modal";
import { createServerClient } from "@/lib/supabase/createServerClient";
import { Users } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("firm_id, role")
    .eq("id", user!.id)
    .single();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, created_at, assigned_staff_id, assigned_reviewer_id")
    .eq("firm_id", profile!.firm_id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Clients
        </h1>
        {profile?.role === "STAFF" && <CreateClientModal />}
      </div>

      {!clients || clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-20 text-center dark:border-zinc-700">
          <Users className="mb-3 h-8 w-8 text-zinc-400" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            No clients yet
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Create your first client to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                  Name
                </th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {clients.map((c) => (
                <tr
                  key={c.id}
                  className="bg-white transition hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/60"
                >
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                    <Link
                      href={`/dashboard/client/${c.id}`}
                      className="hover:text-teal-700 dark:hover:text-teal-400"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
