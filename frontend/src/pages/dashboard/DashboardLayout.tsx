import { useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useOrgStore } from "../../store/org.store";
import OrgSelector from "../components/dashboard/OrgSelector";
import NotificationBell from "../../components/NotificationBell";
import { useNotificationRealtime } from "../../hooks/useNotificationRealtime";
import ActivityFeed from "../org/ActivityFeed";
import { useOrgPermissions } from "../../hooks/useOrgPermissions";

/* Small bolt logo mark to match the landing page */
const BoltIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z" />
  </svg>
);

const MenuIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

function initials(name?: string) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-indigo-500/15 text-indigo-300"
      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200",
  ].join(" ");

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-indigo-500/15 text-indigo-300"
      : "text-slate-300 hover:bg-slate-800/60 hover:text-white",
  ].join(" ");

export default function DashboardLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const orgId = useOrgStore((s) => s.orgId);
  useNotificationRealtime();
  const perms = useOrgPermissions();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 antialiased selection:bg-indigo-500/30">
      {/* ============================ HEADER ============================ */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          {/* Brand + nav */}
          <div className="flex items-center gap-4 lg:gap-6">
            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="rounded-md p-1.5 text-slate-300 transition-colors hover:bg-slate-800/60 hover:text-white md:hidden"
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>

            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
                <BoltIcon className="h-5 w-5 text-white" />
              </span>
              <span className="text-lg font-semibold tracking-tight">NexTask</span>
            </Link>

            {orgId && (
              <nav className="hidden items-center gap-1 md:flex">
                <NavLink to="/app" end className={navLinkClass}>
                  Projects
                </NavLink>
                <NavLink to="/app/activity" className={navLinkClass}>
                  Activity
                </NavLink>
                <NavLink to="/app/invites" className={navLinkClass}>
                  Invites
                </NavLink>
                {perms?.inviteMembers && (
                  <NavLink to="/app/org/invite" className={navLinkClass}>
                    Add Member
                  </NavLink>
                )}
                <NavLink to="/app/org/members" className={navLinkClass}>
                  Members
                </NavLink>
              </nav>
            )}
          </div>

          {/* Org selector + user */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block">
              <OrgSelector />
            </div>

            <div className="hidden h-8 w-px bg-slate-800 sm:block" />

            <Link
              to="/app/notifications"
              className="rounded-md p-1.5 text-slate-300 transition-colors hover:bg-slate-800/60 hover:text-white"
              aria-label="Notifications"
            >
              <NotificationBell />
            </Link>

            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white shadow-md shadow-indigo-500/20">
                {initials(user?.name)}
              </span>
              <div className="hidden text-xs leading-tight lg:block">
                <div className="font-medium text-slate-100">{user?.name}</div>
                <div className="text-slate-500">{user?.email}</div>
              </div>
            </div>

            <button
              onClick={logout}
              className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 transition-colors hover:border-rose-500/60 hover:bg-rose-500/20 hover:text-rose-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="border-t border-slate-800/80 bg-slate-950/95 px-4 py-3 md:hidden">
            <div className="mb-3 sm:hidden">
              <OrgSelector />
            </div>
            {orgId && (
              <nav className="space-y-1">
                <NavLink to="/app" end className={mobileNavLinkClass} onClick={closeMobile}>
                  Projects
                </NavLink>
                <NavLink to="/app/activity" className={mobileNavLinkClass} onClick={closeMobile}>
                  Activity
                </NavLink>
                <NavLink to="/app/invites" className={mobileNavLinkClass} onClick={closeMobile}>
                  Invites
                </NavLink>
                {perms?.inviteMembers && (
                  <NavLink to="/app/org/invite" className={mobileNavLinkClass} onClick={closeMobile}>
                    Add Member
                  </NavLink>
                )}
                <NavLink to="/app/org/members" className={mobileNavLinkClass} onClick={closeMobile}>
                  Members
                </NavLink>
              </nav>
            )}
          </div>
        )}
      </header>

      {/* ============================ MAIN ============================ */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {!orgId && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            <span className="flex h-2 w-2 shrink-0 rounded-full bg-amber-400" />
            Select or create an organization to get started.
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <Outlet />
          </div>

          <aside className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 lg:sticky lg:top-20">
              <ActivityFeed type="sidebar" />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
