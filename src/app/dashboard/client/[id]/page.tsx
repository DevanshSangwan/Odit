import { DocumentCard } from "@/app/dashboard/client/[id]/document-card";
import { createServerClient } from "@/lib/supabase/createServerClient";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type Status =
  | "PENDING"
  | "UPLOADED"
  | "UNDER_REVIEW"
  | "CORRECTION_REQUIRED"
  | "UPLOADED_AGAIN"
  | "APPROVED";

const COLUMNS: { status: Status; label: string; color: string }[] = [
  { status: "PENDING",             label: "Pending",            color: "bg-zinc-100 dark:bg-zinc-800" },
  { status: "UPLOADED",            label: "Uploaded",           color: "bg-blue-50 dark:bg-blue-950/30" },
  { status: "UNDER_REVIEW",        label: "Under Review",       color: "bg-violet-50 dark:bg-violet-950/30" },
  { status: "CORRECTION_REQUIRED", label: "Correction Required",color: "bg-amber-50 dark:bg-amber-950/30" },
  { status: "UPLOADED_AGAIN",      label: "Uploaded Again",     color: "bg-sky-50 dark:bg-sky-950/30" },
  { status: "APPROVED",            label: "Approved",           color: "bg-emerald-50 dark:bg-emerald-950/30" },
];

const BADGE: Record<Status, string> = {
  PENDING:             "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300",
  UPLOADED:            "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  UNDER_REVIEW:        "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
  CORRECTION_REQUIRED: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  UPLOADED_AGAIN:      "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
  APPROVED:            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
};

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("firm_id, role")
    .eq("id", user.id)
    .single();
  if (profileError) console.error("[ClientPage] profile fetch:", profileError);
  if (!profile) redirect("/login");

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, name, created_at")
    .eq("id", id)
    .eq("firm_id", profile.firm_id)
    .single();
  if (clientError) console.error("[ClientPage] client fetch:", clientError);
  if (!client) notFound();

  const { data: documents, error: docsError } = await supabase
    .from("documents")
    .select("id, doc_name, status, latest_comment, file_path")
    .eq("client_id", id)
    .eq("firm_id", profile.firm_id)
    .order("doc_name");
  if (docsError) console.error("[ClientPage] documents fetch:", docsError);

  const byStatus = Object.fromEntries(
    COLUMNS.map((c) => [
      c.status,
      (documents ?? []).filter((d) => d.status === c.status),
    ]),
  ) as Record<Status, typeof documents>;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-200 px-8 py-4 dark:border-zinc-800">
        <Link
          href="/dashboard"
          className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {client.name}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Created {new Date(client.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Empty-documents banner */}
      {(documents ?? []).length === 0 && (
        <div className="mx-6 mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-4 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          No documents created for this client. Documents are added when the
          client is first created.
        </div>
      )}

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-6 w-full min-h-[500px] p-6">
        {COLUMNS.map(({ status, label, color }) => {
          const docs = byStatus[status] ?? [];
          return (
            <div key={status} className="flex w-64 shrink-0 flex-col gap-3">
              {/* Column header */}
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE[status]}`}
                >
                  {label}
                </span>
                <span className="text-xs text-zinc-400">{docs.length}</span>
              </div>

              {/* Column body */}
              <div className={`rounded-xl p-3 ${color} space-y-3 min-h-[420px]`}>
                {docs.length === 0 ? (
                  <p className="pt-4 text-center text-xs text-zinc-400 dark:text-zinc-600">
                    —
                  </p>
                ) : (
                  docs.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      doc={doc}
                      clientId={client.id}
                      clientName={client.name}
                      role={profile.role as "STAFF" | "REVIEWER"}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
