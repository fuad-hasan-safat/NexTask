import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useOrgStore } from "../../store/org.store";
import axiosClient from "../../api/axiosClient";
import { useOrgPermissions } from "../../hooks/useOrgPermissions";

export default function InviteMemberPage() {
  const orgId = useOrgStore((s) => s.orgId);
  const [email, setEmail] = useState("");
  const perms = useOrgPermissions();

  const inviteMutation = useMutation({
    mutationFn: async () => {
      return axiosClient.post(`/orgs/${orgId}/invites`, { email });
    },
    onSuccess: () => {
      setEmail("");
      alert("Invitation sent");
    },
  });

  if (!orgId) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-6 py-16 text-center text-sm text-slate-400">
        Select an organization first.
      </div>
    );
  }

  if (!perms?.inviteMembers) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        You don&apos;t have permission to invite members. Only an owner can send invites.
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    inviteMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Invite a member</h1>
        <p className="mt-1 text-sm text-slate-400">
          Send an invitation by email to add someone to this organization.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
      >
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">
            Email address
          </label>
          <input
            type="email"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-50 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={inviteMutation.isPending || !email.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-600/40 disabled:text-indigo-200/70 disabled:shadow-none"
        >
          {inviteMutation.isPending ? "Sending..." : "Send invite"}
        </button>
      </form>
    </div>
  );
}
