"use client";

import { createClient, type CreateClientState } from "@/app/dashboard/actions";
import { fieldClassName, labelClassName } from "@/components/auth-shell";
import { Plus, Trash2, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useActionState } from "react";
import { toast } from "sonner";

const initial: CreateClientState = { error: null, success: false };

type Reviewer = { id: string; name: string; custom_emp_id: string };

export function CreateClientModal({ reviewers }: { reviewers: Reviewer[] }) {
  const [open, setOpen] = useState(false);
  const [docs, setDocs] = useState([""]);
  const [state, formAction, pending] = useActionState(createClient, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const uid = useId();

  useEffect(() => {
    if (state.success) {
      toast.success("Client created successfully.");
      setOpen(false);
      setDocs([""]);
      formRef.current?.reset();
    } else if (state.error && !state.fieldErrors) {
      toast.error(state.error);
    }
  }, [state]);

  function addDoc() {
    setDocs((d) => [...d, ""]);
  }

  function removeDoc(i: number) {
    setDocs((d) => d.filter((_, idx) => idx !== i));
  }

  function updateDoc(i: number, val: string) {
    setDocs((d) => d.map((v, idx) => (idx === i ? val : v)));
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
      >
        <Plus className="h-4 w-4" />
        Create Client
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                Create Client
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              ref={formRef}
              action={formAction}
              className="space-y-4 px-6 py-5"
            >
              <div>
                <label htmlFor={`${uid}-name`} className={labelClassName}>
                  Client Name
                </label>
                <input
                  id={`${uid}-name`}
                  name="client_name"
                  type="text"
                  required
                  className={fieldClassName}
                  placeholder="Sharma & Co."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={`${uid}-staff`} className={labelClassName}>
                    Staff Custom ID
                  </label>
                  <input
                    id={`${uid}-staff`}
                    name="staff_emp_id"
                    type="text"
                    required
                    className={`${fieldClassName} ${state.fieldErrors?.staff ? "border-red-400 focus:border-red-500" : ""}`}
                    placeholder="AS1"
                  />
                  {state.fieldErrors?.staff && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {state.fieldErrors.staff}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor={`${uid}-reviewer`} className={labelClassName}>
                    Assigned Reviewer
                  </label>
                  <select
                    id={`${uid}-reviewer`}
                    name="reviewer_emp_id"
                    required
                    defaultValue=""
                    className={`${fieldClassName} ${state.fieldErrors?.reviewer ? "border-red-400 focus:border-red-500" : ""} appearance-none`}
                  >
                    <option value="" disabled>Select a reviewer</option>
                    {reviewers.map((r) => (
                      <option key={r.id} value={r.custom_emp_id}>
                        {r.name} ({r.custom_emp_id})
                      </option>
                    ))}
                  </select>
                  {state.fieldErrors?.reviewer && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {state.fieldErrors.reviewer}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className={labelClassName}>Required Documents</p>
                <div className="space-y-2">
                  {docs.map((val, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        name="doc_names[]"
                        type="text"
                        value={val}
                        onChange={(e) => updateDoc(i, e.target.value)}
                        className={fieldClassName}
                        placeholder={`Document ${i + 1}`}
                      />
                      {docs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDoc(i)}
                          className="shrink-0 rounded-lg p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addDoc}
                  className="mt-2 flex items-center gap-1 text-sm font-medium text-teal-700 transition hover:text-teal-800 dark:text-teal-400"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add document
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? "Creating…" : "Create Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
