import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { createOrgApi, fetchOrgsApi } from "../../../api/orgApi";
import { useOrgStore } from "../../../store/org.store";

export default function OrgSelector() {
  const queryClient = useQueryClient();

  const { data: orgs, isLoading } = useQuery({
    queryKey: ["orgs"],
    queryFn: fetchOrgsApi,
  });

  const orgId = useOrgStore((s) => s.orgId);
  const setOrg = useOrgStore((s) => s.setOrg);

  const [newOrgName, setNewOrgName] = useState("");
  const [creating, setCreating] = useState(false);

  const { mutate: createOrg, isPending } = useMutation({
    mutationFn: createOrgApi,
    onSuccess: () => {
      setNewOrgName("");
      setCreating(false);
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
    },
  });

  const handleCreateOrg = (e: FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    createOrg({ name: newOrgName.trim() });
  };

  if (isLoading) {
    return <span className="text-xs text-slate-500">Loading orgs…</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <select
          className="appearance-none rounded-md border border-slate-700 bg-slate-900 py-1.5 pl-3 pr-8 text-sm text-slate-100 transition-colors hover:border-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          value={orgId ?? ""}
          onChange={(e) => {
            const selectedOrg = orgs?.find((o) => o.orgId === e.target.value);
            if (!selectedOrg) return;
            setOrg(selectedOrg.orgId, selectedOrg.role);
          }}
        >
          <option value="">Select organization</option>
          {orgs?.map((org) => (
            <option key={org.orgId} value={org.orgId}>
              {org.name} ({org.role})
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {creating ? (
        <form onSubmit={handleCreateOrg} className="flex items-center gap-1.5">
          <input
            type="text"
            autoFocus
            placeholder="New org name"
            className="w-32 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            onBlur={() => !newOrgName.trim() && setCreating(false)}
          />
          <button
            type="submit"
            disabled={isPending || !newOrgName.trim()}
            className="rounded-md bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-600/40 disabled:text-indigo-200/70 disabled:shadow-none"
          >
            {isPending ? "…" : "Add"}
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-md border border-slate-700 px-2.5 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white"
          title="Create organization"
        >
          + New
        </button>
      )}
    </div>
  );
}