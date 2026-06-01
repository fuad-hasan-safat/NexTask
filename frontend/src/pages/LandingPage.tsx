import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

/* ------------------------------------------------------------------ */
/* Inline icons (no extra deps)                                        */
/* ------------------------------------------------------------------ */
type IconProps = { className?: string };

const BoltIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z" />
  </svg>
);

const BoardIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
    <rect x="3" y="4" width="5" height="16" rx="1.5" />
    <rect x="9.5" y="4" width="5" height="11" rx="1.5" />
    <rect x="16" y="4" width="5" height="14" rx="1.5" />
  </svg>
);

const BuildingIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16M14 9h4a1 1 0 0 1 1 1v11M8 8h2M8 12h2M8 16h2" />
  </svg>
);

const ChatIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 9 9 0 0 1-3.9-.9L3 21l1.9-5.6A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z" />
  </svg>
);

const BellIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
  </svg>
);

const PulseIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l2 7 4-16 2 9h6" />
  </svg>
);

const ShieldIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6l-8-3Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
  </svg>
);

const CheckIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */
const features = [
  {
    icon: BoltIcon,
    title: "Real-time sync",
    desc: "Powered by Socket.IO. Task moves, comments, and assignments appear instantly for everyone — no refresh.",
  },
  {
    icon: BoardIcon,
    title: "Kanban boards",
    desc: "Drag & drop across Backlog, In Progress, Review, and Done. Priorities, due dates, and assignees built in.",
  },
  {
    icon: BuildingIcon,
    title: "Multi-tenant orgs",
    desc: "Belong to multiple organizations with fully isolated data. Spin up workspaces for every team.",
  },
  {
    icon: ChatIcon,
    title: "Live comments",
    desc: "Threaded discussions on every task with author metadata and timestamps that update live as you talk.",
  },
  {
    icon: BellIcon,
    title: "Instant notifications",
    desc: "A realtime bell that alerts you on assignments, comments, and team activity the moment they happen.",
  },
  {
    icon: PulseIcon,
    title: "Activity feed",
    desc: "A running log of who did what and when — task creation, updates, assignments, and comments.",
  },
];

const roles = [
  { name: "Owner", perms: "Full control of the organization", accent: "from-indigo-500 to-violet-500" },
  { name: "Admin", perms: "Manage members & projects", accent: "from-sky-500 to-indigo-500" },
  { name: "Member", perms: "Create & manage tasks", accent: "from-emerald-500 to-teal-500" },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  const user = useAuthStore((s) => s.user);
  const primaryHref = user ? "/app" : "/register";
  const primaryLabel = user ? "Open dashboard" : "Get started free";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 antialiased selection:bg-indigo-500/30">
      {/* ============================== NAV ============================== */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
              <BoltIcon className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-semibold tracking-tight">NexTask</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#realtime" className="hover:text-white transition-colors">Real-time</a>
            <a href="#roles" className="hover:text-white transition-colors">Roles</a>
          </nav>

          <div className="flex items-center gap-3">
            {!user && (
              <Link to="/login" className="hidden text-sm text-slate-300 hover:text-white transition-colors sm:inline">
                Sign in
              </Link>
            )}
            <Link
              to={primaryHref}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-colors"
            >
              {primaryLabel}
            </Link>
          </div>
        </div>
      </header>

      {/* ============================== HERO ============================== */}
      <section className="relative overflow-hidden">
        {/* glow backdrop */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-10rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />
          <div className="absolute right-[-6rem] top-40 h-72 w-72 rounded-full bg-violet-600/20 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center sm:pt-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3.5 py-1.5 text-xs font-medium text-slate-300">
            <span className="flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Real-time team collaboration
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Where teams turn{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
              chaos into done
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            NexTask is the multi-tenant project platform where your tasks, comments, and
            notifications sync in real time. Drag a card, drop a comment — everyone sees it instantly.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={primaryHref}
              className="w-full rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 transition-colors sm:w-auto"
            >
              {primaryLabel}
            </Link>
            <a
              href="#features"
              className="w-full rounded-md border border-slate-700 bg-slate-900/50 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors sm:w-auto"
            >
              Explore features
            </a>
          </div>

          {/* App preview: mini kanban board */}
          <div className="relative mx-auto mt-16 max-w-4xl">
            <div className="absolute inset-x-8 -bottom-6 h-24 rounded-full bg-indigo-600/20 blur-3xl" />
            <BoardPreview />
          </div>
        </div>
      </section>

      {/* ============================== STATS ============================== */}
      <section className="border-y border-slate-800/80 bg-slate-900/30">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px px-6 py-2 sm:grid-cols-4">
          {[
            { k: "Instant", v: "WebSocket sync" },
            { k: "Multi-tenant", v: "Unlimited orgs" },
            { k: "4 stages", v: "Kanban workflow" },
            { k: "Role-based", v: "Access control" },
          ].map((s) => (
            <div key={s.k} className="px-2 py-6 text-center">
              <div className="text-xl font-bold text-white sm:text-2xl">{s.k}</div>
              <div className="mt-1 text-xs text-slate-400">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================== FEATURES ============================== */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything your team needs to ship
          </h2>
          <p className="mt-4 text-slate-400">
            A complete collaboration toolkit — built for the way modern teams actually work together.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:-translate-y-1 hover:border-indigo-500/50 hover:bg-slate-900"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 ring-1 ring-inset ring-indigo-500/20 transition-colors group-hover:bg-indigo-500/20">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================== REALTIME ============================== */}
      <section id="realtime" className="border-y border-slate-800/80 bg-slate-900/30">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
              <BoltIcon className="h-3.5 w-3.5" /> Powered by Socket.IO
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Collaboration that feels{" "}
              <span className="text-indigo-400">alive</span>
            </h2>
            <p className="mt-4 leading-relaxed text-slate-400">
              No more "did you refresh?" Every action propagates over WebSockets to
              every teammate in milliseconds. Watch the board update itself as work happens.
            </p>
            <ul className="mt-7 space-y-3">
              {[
                "Tasks move across columns live as teammates drag them",
                "Comments stream in without reloading the page",
                "Notification bell updates the instant you're mentioned",
                "Activity feed records every change as it occurs",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Live event stream mock */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-2xl shadow-black/40">
            <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <PulseIcon className="h-4 w-4 text-indigo-400" /> Live activity
              </div>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                connected
              </span>
            </div>
            <ul className="space-y-3 text-sm">
              {[
                { who: "Sara", what: "moved", obj: "Auth flow", to: "→ Review", c: "text-violet-400" },
                { who: "Mike", what: "commented on", obj: "API gateway", to: "", c: "text-sky-400" },
                { who: "Ava", what: "completed", obj: "Landing page", to: "→ Done", c: "text-emerald-400" },
                { who: "You", what: "were assigned", obj: "Payments", to: "", c: "text-indigo-400" },
              ].map((e, i) => (
                <li key={i} className="flex items-center gap-3 rounded-lg bg-slate-900/60 px-3 py-2.5">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${e.c.replace("text-", "bg-")}`} />
                  <span className="text-slate-300">
                    <span className={`font-medium ${e.c}`}>{e.who}</span> {e.what}{" "}
                    <span className="font-medium text-slate-100">{e.obj}</span>{" "}
                    {e.to && <span className="text-slate-500">{e.to}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============================== ROLES ============================== */}
      <section id="roles" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-300">
            <ShieldIcon className="h-3.5 w-3.5 text-indigo-400" /> Role-based access control
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            The right access for everyone
          </h2>
          <p className="mt-4 text-slate-400">
            Every organization gets granular roles so the right people have the right control.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {roles.map((r) => (
            <div key={r.name} className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${r.accent}`} />
              <div className={`mb-4 inline-flex rounded-lg bg-gradient-to-br ${r.accent} p-2.5 shadow-lg`}>
                <ShieldIcon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">{r.name}</h3>
              <p className="mt-1.5 text-sm text-slate-400">{r.perms}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================== CTA ============================== */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-600/20 via-slate-900 to-violet-600/20 px-6 py-16 text-center">
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-500/30 blur-[100px]" />
          <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to bring your team together?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-slate-300">
            Create your organization, invite your team, and start shipping in real time — today.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={primaryHref}
              className="w-full rounded-md bg-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 transition-colors sm:w-auto"
            >
              {primaryLabel}
            </Link>
            {!user && (
              <Link
                to="/login"
                className="w-full rounded-md border border-slate-600 bg-slate-900/50 px-7 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors sm:w-auto"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ============================== FOOTER ============================== */}
      <footer className="border-t border-slate-800/80">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <BoltIcon className="h-4 w-4 text-white" />
            </span>
            <span className="font-semibold tracking-tight">NexTask</span>
          </div>
          <p className="text-xs text-slate-500">
            © {2026} NexTask. Real-time team collaboration, built on the MERN stack.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero board preview                                                  */
/* ------------------------------------------------------------------ */
function BoardPreview() {
  const columns = [
    {
      title: "Backlog",
      dot: "bg-slate-400",
      cards: [
        { t: "Design system tokens", p: "Low", pc: "text-slate-400 bg-slate-700/40" },
        { t: "Research auth providers", p: "Med", pc: "text-amber-300 bg-amber-500/15" },
      ],
    },
    {
      title: "In Progress",
      dot: "bg-sky-400",
      cards: [
        { t: "Realtime comment stream", p: "High", pc: "text-rose-300 bg-rose-500/15" },
        { t: "Kanban drag & drop", p: "Med", pc: "text-amber-300 bg-amber-500/15" },
      ],
    },
    {
      title: "Review",
      dot: "bg-violet-400",
      cards: [{ t: "Notification bell", p: "High", pc: "text-rose-300 bg-rose-500/15" }],
    },
    {
      title: "Done",
      dot: "bg-emerald-400",
      cards: [
        { t: "Org multi-tenancy", p: "Done", pc: "text-emerald-300 bg-emerald-500/15" },
        { t: "JWT auth", p: "Done", pc: "text-emerald-300 bg-emerald-500/15" },
      ],
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 shadow-2xl shadow-black/50 backdrop-blur sm:p-4">
      {/* fake window bar */}
      <div className="mb-3 flex items-center gap-1.5 px-1">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-3 text-xs text-slate-500">nextask · Product Launch</span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {columns.map((col) => (
          <div key={col.title} className="rounded-xl bg-slate-950/60 p-2.5">
            <div className="mb-2.5 flex items-center gap-2 px-1">
              <span className={`h-2 w-2 rounded-full ${col.dot}`} />
              <span className="text-xs font-medium text-slate-300">{col.title}</span>
              <span className="ml-auto text-[10px] text-slate-600">{col.cards.length}</span>
            </div>
            <div className="space-y-2">
              {col.cards.map((c) => (
                <div
                  key={c.t}
                  className="rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-left transition-colors hover:border-slate-700"
                >
                  <p className="text-xs font-medium leading-snug text-slate-200">{c.t}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${c.pc}`}>{c.p}</span>
                    <span className="flex -space-x-1.5">
                      <span className="h-4 w-4 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 ring-2 ring-slate-900" />
                      <span className="h-4 w-4 rounded-full bg-gradient-to-br from-sky-400 to-emerald-500 ring-2 ring-slate-900" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
