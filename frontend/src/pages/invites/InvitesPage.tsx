import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchInvitesApi,
  acceptInviteApi,
  rejectInviteApi,
  type Invite,
} from "../../api/inviteApi";

export default function InvitesPage() {
  const queryClient = useQueryClient();

  const { data: invites, isLoading } = useQuery({
    queryKey: ["invites"],
    queryFn: fetchInvitesApi,
  });

  const acceptMutation = useMutation({
    mutationFn: acceptInviteApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites"] });
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectInviteApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites"] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Invites</h1>
        <p className="mt-1 text-sm text-slate-400">
          Organizations that have invited you to collaborate.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/50"
            />
          ))}
        </div>
      ) : !invites || invites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-6 py-16 text-center">
          <p className="text-sm font-medium text-slate-300">No pending invitations</p>
          <p className="mt-1 text-xs text-slate-500">
            You&apos;ll see organization invites here when someone adds you.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {invites.map((invite: Invite) => (
            <li
              key={invite._id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-slate-100">
                  {invite.orgId.name}
                </div>
                <div className="text-xs text-slate-400">Role: {invite.role}</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => acceptMutation.mutate(invite._id)}
                  disabled={acceptMutation.isPending}
                  className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition-colors hover:bg-emerald-500 disabled:opacity-60"
                >
                  Accept
                </button>

                <button
                  onClick={() => rejectMutation.mutate(invite._id)}
                  disabled={rejectMutation.isPending}
                  className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3.5 py-1.5 text-xs font-semibold text-rose-300 transition-colors hover:border-rose-500/60 hover:bg-rose-500/20 hover:text-rose-200 disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
