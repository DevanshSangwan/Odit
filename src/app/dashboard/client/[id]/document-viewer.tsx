"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

type Status =
  | "PENDING"
  | "UPLOADED"
  | "UNDER_REVIEW"
  | "CORRECTION_REQUIRED"
  | "UPLOADED_AGAIN"
  | "APPROVED";

const STATUS_LABEL: Record<Status, string> = {
  PENDING:             "Pending",
  UPLOADED:            "Uploaded",
  UNDER_REVIEW:        "Under Review",
  CORRECTION_REQUIRED: "Correction Required",
  UPLOADED_AGAIN:      "Uploaded Again",
  APPROVED:            "Approved",
};

const STATUS_BADGE: Record<Status, string> = {
  PENDING:             "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300",
  UPLOADED:            "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  UNDER_REVIEW:        "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
  CORRECTION_REQUIRED: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  UPLOADED_AGAIN:      "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
  APPROVED:            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
};

function formatDateTime(ts: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(ts));
}

type Props = {
  signedUrl: string;
  docName: string;
  clientName: string;
  status: string;
  updatedAt: string | null;
  uploaderName: string | null;
  uploaderStaffId: string | null;
  latestComment: string | null;
  onClose: () => void;
};

export function DocumentViewer({
  signedUrl,
  docName,
  clientName,
  status,
  updatedAt,
  uploaderName,
  uploaderStaffId,
  latestComment,
  onClose,
}: Props) {
  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const badge = STATUS_BADGE[status as Status] ?? "bg-zinc-100 text-zinc-600";
  const label = STATUS_LABEL[status as Status] ?? status;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="grid h-[90vh] w-full max-w-6xl grid-cols-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">

        {/* ── Left: PDF viewer (col-span-2) ── */}
        <div className="col-span-2 flex flex-col border-r border-zinc-200 dark:border-zinc-800">
          <div className="flex h-12 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
            <span className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {docName}
            </span>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Close viewer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <iframe
            src={signedUrl}
            className="flex-1 w-full"
            title={docName}
          />
        </div>

        {/* ── Right: Metadata panel (col-span-1) ── */}
        <div className="flex flex-col gap-5 overflow-y-auto p-6">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {docName}
          </h2>

          <MetaRow label="Client" value={clientName} />

          <div>
            <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Uploaded By
            </p>
            <p className="text-sm text-zinc-900 dark:text-zinc-50">
              {uploaderName ?? "—"}
            </p>
            {uploaderStaffId && (
              <span className="mt-1 inline-block rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {uploaderStaffId}
              </span>
            )}
          </div>

          <MetaRow
            label="Last Updated"
            value={updatedAt ? formatDateTime(updatedAt) : "—"}
          />

          <div>
            <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Status
            </p>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge}`}>
              {label}
            </span>
          </div>

          {latestComment && (
            <div>
              <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Review Comment
              </p>
              <div className="rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                💬 {latestComment}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="text-sm text-zinc-900 dark:text-zinc-50">{value}</p>
    </div>
  );
}
