import { useQuery } from "@tanstack/react-query";
import { useOrgStore } from "../../store/org.store";
import { fetchProjectsApi, type Project } from "../../api/projectApi";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateProjectModal from "../../components/CreateProjectModal";

/* ---- icons ---- */
const FolderIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
  </svg>
);
const PlusIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
  </svg>
);
const ArrowIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const GridIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);
const ListIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
  </svg>
);

const CARD_ACCENTS = [
  "from-indigo-500 to-violet-500",
  "from-sky-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-fuchsia-500 to-purple-500",
];

type Layout = "grid" | "list";
const LAYOUT_KEY = "projects:layout";

export default function ProjectsPage() {
  const orgId = useOrgStore((s) => s.orgId);
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [layout, setLayout] = useState<Layout>(
    () => (localStorage.getItem(LAYOUT_KEY) as Layout) || "grid",
  );

  useEffect(() => {
    localStorage.setItem(LAYOUT_KEY, layout);
  }, [layout]);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects", orgId],
    queryFn: () => fetchProjectsApi(orgId!),
    enabled: !!orgId,
  });

  if (!orgId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-6 py-20 text-center">
        <FolderIcon className="h-10 w-10 text-slate-600" />
        <p className="mt-4 text-sm text-slate-400">No organization selected.</p>
        <p className="mt-1 text-xs text-slate-500">Pick one from the top bar to view its projects.</p>
      </div>
    );
  }

  const hasProjects = !!projects && projects.length > 0;
  const isGrid = layout === "grid";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Projects</h1>
          <p className="mt-1 text-sm text-slate-400">
            {hasProjects
              ? `${projects!.length} project${projects!.length > 1 ? "s" : ""} in this organization`
              : "Create your first project to start tracking work."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout toggle */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/50 p-0.5">
            <button
              onClick={() => setLayout("grid")}
              aria-pressed={isGrid}
              title="Grid view"
              className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                isGrid
                  ? "bg-indigo-500/15 text-indigo-300"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <GridIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setLayout("list")}
              aria-pressed={!isGrid}
              title="List view"
              className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                !isGrid
                  ? "bg-indigo-500/15 text-indigo-300"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-colors hover:bg-indigo-500"
          >
            <PlusIcon className="h-4 w-4" />
            New project
          </button>
        </div>
      </div>

      {/* Projects */}
      <section>
        {isLoading ? (
          <div className={isGrid ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`animate-pulse rounded-2xl border border-slate-800 bg-slate-900/50 ${
                  isGrid ? "h-28" : "h-18"
                }`}
              />
            ))}
          </div>
        ) : hasProjects ? (
          <div className={isGrid ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
            {projects!.map((p: Project, i) =>
              isGrid ? (
                <button
                  key={p._id}
                  onClick={() => navigate(`/app/projects/${p._id}`)}
                  className="group relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-left transition-all hover:-translate-y-1 hover:border-indigo-500/50 hover:bg-slate-900"
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${
                        CARD_ACCENTS[i % CARD_ACCENTS.length]
                      } shadow-lg`}
                    >
                      <FolderIcon className="h-5 w-5 text-white" />
                    </span>
                    <ArrowIcon className="h-4 w-4 translate-x-0 text-slate-600 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-indigo-400 group-hover:opacity-100" />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-100">{p.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                    {p.description || "No description"}
                  </p>
                </button>
              ) : (
                <button
                  key={p._id}
                  onClick={() => navigate(`/app/projects/${p._id}`)}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-left transition-all hover:border-indigo-500/50 hover:bg-slate-900"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${
                      CARD_ACCENTS[i % CARD_ACCENTS.length]
                    } shadow-lg`}
                  >
                    <FolderIcon className="h-5 w-5 text-white" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-slate-100">{p.name}</h3>
                    <p className="truncate text-sm text-slate-400">
                      {p.description || "No description"}
                    </p>
                  </div>
                  <ArrowIcon className="h-4 w-4 shrink-0 text-slate-600 transition-all group-hover:translate-x-0.5 group-hover:text-indigo-400" />
                </button>
              ),
            )}

            {/* Add-project tile */}
            {isGrid ? (
              <button
                onClick={() => setModalOpen(true)}
                className="group flex min-h-35 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 p-5 text-slate-500 transition-all hover:-translate-y-1 hover:border-indigo-500/50 hover:text-indigo-300"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-400 transition-colors group-hover:bg-indigo-500/15 group-hover:text-indigo-300">
                  <PlusIcon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium">New project</span>
              </button>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="group flex w-full items-center gap-4 rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 p-4 text-slate-500 transition-all hover:border-indigo-500/50 hover:text-indigo-300"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-400 transition-colors group-hover:bg-indigo-500/15 group-hover:text-indigo-300">
                  <PlusIcon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium">New project</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-6 py-16 text-center">
            <FolderIcon className="h-10 w-10 text-slate-600" />
            <p className="mt-4 text-sm font-medium text-slate-300">No projects yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Get started by creating your first project.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-colors hover:bg-indigo-500"
            >
              <PlusIcon className="h-4 w-4" />
              Create project
            </button>
          </div>
        )}
      </section>

      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        orgId={orgId}
      />
    </div>
  );
}
