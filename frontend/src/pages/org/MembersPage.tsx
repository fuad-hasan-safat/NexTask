import { useOrgStore } from "../../store/org.store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMembersApi,
  removeMemberApi,
  type OrgMember,
} from "../../api/memberApi";
import { useOrgPermissions } from "../../hooks/useOrgPermissions";

function initials(name?: string) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

const roleBadge = (role: string) => {
  switch (role) {
    case "OWNER":
      return "bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-500/20";
    case "ADMIN":
      return "bg-sky-500/15 text-sky-300 ring-1 ring-inset ring-sky-500/20";
    default:
      return "bg-slate-700/50 text-slate-300 ring-1 ring-inset ring-slate-600/40";
  }
};

export default function MembersPage() {
  const orgId = useOrgStore((s) => s.orgId);
  const queryClient = useQueryClient();
  const perms = useOrgPermissions();

  const { data: members, isLoading } = useQuery({
    queryKey: ["members", orgId],
    queryFn: () => fetchMembersApi(orgId!),
    enabled: !!orgId,
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => removeMemberApi(orgId!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", orgId] });
    },
  });

  if (!orgId) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-6 py-16 text-center text-sm text-slate-400">
        Select an organization to view its members.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Members</h1>
        <p className="mt-1 text-sm text-slate-400">
          {members?.length
            ? `${members.length} member${members.length > 1 ? "s" : ""} in this organization`
            : "People with access to this organization."}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/50"
            />
          ))}
        </div>
      ) : (
        <ul className="space-y-3">
          {members?.map((m: OrgMember) => (
            <li
              key={m.userId._id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white shadow-md shadow-indigo-500/20">
                  {initials(m.userId.name)}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-slate-100">
                    {m.userId.name}
                  </div>
                  <div className="truncate text-xs text-slate-400">
                    {m.userId.email}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${roleBadge(
                    m.role,
                  )}`}
                >
                  {m.role}
                </span>

                {perms?.removeMembers && m.role !== "OWNER" && (
                  <button
                    onClick={() => {
                      if (confirm("Remove this member?")) {
                        removeMutation.mutate(m.userId._id);
                      }
                    }}
                    className="text-xs font-medium text-rose-400 transition-colors hover:text-rose-300"
                  >
                    Remove
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
