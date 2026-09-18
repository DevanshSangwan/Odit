"use client";

import {
  getDocumentUrl,
  reviewDocument,
  uploadDocument,
} from "@/app/dashboard/client/[id]/actions";
import { DocumentViewer } from "@/app/dashboard/client/[id]/document-viewer";
import { CheckCircle2, Eye, MessageSquare, RotateCcw, Upload } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Doc = {
  id: string;
  doc_name: string;
  status: string;
  latest_comment: string | null;
  file_path: string | null;
  updated_at: string | null;
  uploader_name: string | null;
  uploader_staff_id: string | null;
};

type Props = {
  doc: Doc;
  clientId: string;
  clientName: string;
  role: "STAFF" | "REVIEWER";
};

const idle = { error: null, success: false };

// ─── Upload form (STAFF) ──────────────────────────────────────────────────────

const MAX_FILE_BYTES = 10 * 1024 * 1024;

function UploadForm({ doc, clientId, clientName }: Omit<Props, "role">) {
  const [state, action, pending] = useActionState(uploadDocument, idle);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success(`"${doc.doc_name}" uploaded.`);
      setSizeError(null);
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, doc.doc_name]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setSizeError(file && file.size > MAX_FILE_BYTES ? "File size exceeds 10MB limit." : null);
  }

  return (
    <form ref={formRef} action={action} className="mt-3 space-y-2">
      <input type="hidden" name="document_id" value={doc.id} />
      <input type="hidden" name="client_id" value={clientId} />
      <input type="hidden" name="client_name" value={clientName} />
      <input type="hidden" name="doc_name" value={doc.doc_name} />
      <input type="hidden" name="current_status" value={doc.status} />
      <input
        name="file"
        type="file"
        accept="application/pdf"
        required
        onChange={handleFileChange}
        className="block w-full text-xs text-zinc-500 file:mr-2 file:rounded-md file:border-0 file:bg-teal-50 file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-teal-700 hover:file:bg-teal-100 dark:text-zinc-400 dark:file:bg-teal-950/40 dark:file:text-teal-400"
      />
      {sizeError && (
        <p className="text-xs text-red-600 dark:text-red-400">{sizeError}</p>
      )}
      <button
        type="submit"
        disabled={pending || !!sizeError}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
      >
        <Upload className="h-3.5 w-3.5" />
        {pending ? "Uploading…" : "Upload PDF"}
      </button>
    </form>
  );
}

// ─── Review controls (REVIEWER) ──────────────────────────────────────────────

function ReviewControls({ doc, clientId, clientName }: Omit<Props, "role">) {
  const [state, action, pending] = useActionState(reviewDocument, idle);
  const [showComment, setShowComment] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Document status updated.");
      setShowComment(false);
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  const canStartReview = ["UPLOADED", "UPLOADED_AGAIN"].includes(doc.status);
  const canDecide = doc.status === "UNDER_REVIEW";

  if (!canStartReview && !canDecide) return null;

  return (
    <form ref={formRef} action={action} className="mt-3 space-y-2">
      <input type="hidden" name="document_id" value={doc.id} />
      <input type="hidden" name="client_id" value={clientId} />
      <input type="hidden" name="client_name" value={clientName} />
      <input type="hidden" name="doc_name" value={doc.doc_name} />
      <input type="hidden" name="current_status" value={doc.status} />

      {canStartReview && (
        <>
          <input type="hidden" name="new_status" value="UNDER_REVIEW" />
          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {pending ? "Starting…" : "Start Review"}
          </button>
        </>
      )}

      {canDecide && (
        <>
          {showComment ? (
            <>
              <input type="hidden" name="new_status" value="CORRECTION_REQUIRED" />
              <textarea
                name="comment"
                required
                rows={2}
                placeholder="Describe the correction needed…"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  {pending ? "Sending…" : "Request Correction"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowComment(false)}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <ApproveButton pending={pending} />
              <button
                type="button"
                onClick={() => setShowComment(true)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Correction
              </button>
            </div>
          )}
        </>
      )}
    </form>
  );
}

function ApproveButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      name="new_status"
      value="APPROVED"
      disabled={pending}
      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
    >
      <CheckCircle2 className="h-3.5 w-3.5" />
      Approve
    </button>
  );
}

// ─── Document Card ────────────────────────────────────────────────────────────

export function DocumentCard({ doc, clientId, clientName, role }: Props) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [urlLoading, setUrlLoading] = useState(false);

  const canUpload =
    role === "STAFF" && ["PENDING", "CORRECTION_REQUIRED"].includes(doc.status);
  const hasFile = !!doc.file_path;

  async function openViewer() {
    if (!doc.file_path) return;
    setUrlLoading(true);
    const { url, error } = await getDocumentUrl(doc.file_path);
    setUrlLoading(false);
    if (error || !url) {
      toast.error(error ?? "Could not load document.");
      return;
    }
    setSignedUrl(url);
    setViewerOpen(true);
  }

  return (
    <>
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {doc.doc_name}
          </p>
          {hasFile && (
            <button
              onClick={openViewer}
              disabled={urlLoading}
              title="View document"
              className="shrink-0 rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
        </div>

        {doc.latest_comment && (
          <p className="mt-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            💬 {doc.latest_comment}
          </p>
        )}

        {canUpload && (
          <UploadForm doc={doc} clientId={clientId} clientName={clientName} />
        )}

        {role === "REVIEWER" && (
          <ReviewControls doc={doc} clientId={clientId} clientName={clientName} />
        )}
      </div>

      {viewerOpen && signedUrl && (
        <DocumentViewer
          signedUrl={signedUrl}
          docName={doc.doc_name}
          clientName={clientName}
          status={doc.status}
          updatedAt={doc.updated_at}
          uploaderName={doc.uploader_name}
          uploaderStaffId={doc.uploader_staff_id}
          latestComment={doc.latest_comment}
          onClose={() => {
            setViewerOpen(false);
            setSignedUrl(null);
          }}
        />
      )}
    </>
  );
}
