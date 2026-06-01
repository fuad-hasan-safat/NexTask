import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProjectApi } from "../api/projectApi";

type Props = {
  open: boolean;
  onClose: () => void;
  orgId: string | null;
};

const PlusIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

export default function CreateProjectModal({ open, onClose, orgId }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", description: "" });

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      createProjectApi(orgId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", orgId] });
      onClose();
    },
  });

  /* reset form + error each time the modal opens */
  useEffect(() => {
    if (open) {
      setForm({ name: "", description: "" });
      reset();
    }
  }, [open, reset]);

  /* close on Escape */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isPending, onClose]);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!orgId || !form.name.trim()) return;
    mutate({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
    });
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isPending && onClose()}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
                  <PlusIcon className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-white">Create new project</h2>
                  <p className="text-xs text-slate-500">Add a project to this organization</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isPending && onClose()}
                disabled={isPending}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-50"
                aria-label="Close"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-5 px-6 py-6">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Project name
                  </label>
                  <input
                    autoFocus
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-50 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    placeholder="e.g. Product Launch"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Description{" "}
                    <span className="font-normal text-slate-600">(optional)</span>
                  </label>
                  <textarea
                    className="min-h-24 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-50 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    placeholder="What is this project about?"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                </div>

                {error && (
                  <p className="text-sm text-rose-400">
                    {(error as any)?.response?.data?.message ?? "Failed to create project"}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 border-t border-slate-800 bg-slate-900/60 px-6 py-4">
                <button
                  type="button"
                  onClick={() => !isPending && onClose()}
                  disabled={isPending}
                  className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !form.name.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-600/40 disabled:text-indigo-200/70 disabled:shadow-none"
                >
                  <PlusIcon className="h-4 w-4" />
                  {isPending ? "Creating..." : "Create project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
