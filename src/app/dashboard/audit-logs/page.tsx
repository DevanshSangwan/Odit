import { createServerClient } from "@/lib/supabase/createServerClient";
import { FileText } from "lucide-react";
import { redirect } from "next/navigation";

const ACTION_LABELS: Record<string, string> = {
  CLIENT_CREATED: "Client Created",
  DOC_UPLOADED: "Document Uploaded",
  DOC_UPLOADED_AGAIN: "Document Re-uploaded",
  DOC_REVIEW_STARTED: "Review Started",
  DOC_APPROVED: "Document Approved",
  DOC_CORRECTION_REQUIRED: "Correction Required",
  CLIENT_DELETED: "Client Deleted",
};

const ACTION_BADGE: Record<string, string> = {
  CLIENT_CREATED: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  DOC_UPLOADED: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  DOC_UPLOADED_AGAIN: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  DOC_REVIEW_STARTED: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  DOC_APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  DOC_CORRECTION_REQUIRED: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  CLIENT_DELETED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

function formatDate(ts: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(ts));
}

export default async function AuditLogsPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: logs, error } = await supabase
    .from("audit_logs")
    .select(
      "id, created_at, action, client_name, document_name, comment, user_id, profiles(name)",
    )
    .order("created_at", { ascending: false });

  if (error) console.error("[AuditLogsPage] fetch:", error);

  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Audit Logs
      </h1>

      {!logs || logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-20 text-center dark:border-zinc-700">
          <FileText className="mb-3 h-8 w-8 text-zinc-400" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            No audit events yet
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Actions taken on clients and documents will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left dark:border-zinc-800 dark:bg-zinc-900">
                {["Date / Time", "User", "Action", "Client", "Document", "Comment"].map(
                  (h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {logs.map((log) => {
                const userName =
                  (log.profiles as { name: string } | null)?.name ?? "—";
                const badge =
                  ACTION_BADGE[log.action] ??
                  "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
                const label = ACTION_LABELS[log.action] ?? log.action;

                return (
                  <tr
                    key={log.id}
                    className="bg-white align-top dark:bg-zinc-900"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                      {userName}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge}`}
                      >
                        {label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {log.client_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {log.document_name ?? "—"}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {log.comment ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
