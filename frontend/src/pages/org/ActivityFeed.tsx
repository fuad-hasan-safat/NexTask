import { useQuery } from "@tanstack/react-query";
import { fetchOrgActivityApi } from "../../api/activityApi";
import { useOrgStore } from "../../store/org.store";
import { useActivityRealtime } from "../../hooks/useActivityRealtime";

export default function ActivityFeed({ type = "page" }) {
  const orgId = useOrgStore((s) => s.orgId);
  const isSidebar = type === "sidebar";

  useActivityRealtime(orgId);

  const { data, isLoading } = useQuery({
    queryKey: ["activity", orgId],
    queryFn: () => fetchOrgActivityApi(orgId!),
    enabled: !!orgId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 60 * 1000, // 1 minute
  });

  if (!orgId) {
    return (
      <div className="text-sm text-slate-500">
        Select an organization to see activity.
      </div>
    );
  }

  const items = data ?? [];
  const visible = isSidebar ? items.slice(0, 10) : items;

  return (
    <div className={isSidebar ? "space-y-3" : "space-y-4"}>
      <div className="flex items-center gap-2">
        <h2
          className={
            isSidebar
              ? "text-sm font-semibold text-slate-200"
              : "text-2xl font-bold tracking-tight text-white"
          }
        >
          {isSidebar ? "Recent Activity" : "Activity"}
        </h2>
        {!isSidebar && items.length > 0 && (
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
            {items.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: isSidebar ? 4 : 6 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-lg border border-slate-800 bg-slate-900/50"
            />
          ))}
        </div>
      ) : visible.length > 0 ? (
        <ul className="space-y-2">
          {visible.map((a) => {
            const meta = activityMeta(a.type);
            return (
              <li
                key={a._id}
                className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2.5 transition-colors hover:border-slate-700"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[10px] font-semibold text-white">
                  {initials(a.actorId?.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs leading-snug text-slate-300">
                    <span className="font-medium text-slate-100">
                      {a.actorId?.name ?? "Someone"}
                    </span>{" "}
                    <span className={meta.color}>{meta.label}</span>
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    {relativeTime(a.createdAt)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900/30 px-3 py-6 text-center text-xs text-slate-500">
          No activity yet.
        </div>
      )}
    </div>
  );
}

function initials(name?: string) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function activityMeta(type: string): { label: string; color: string } {
  switch (type) {
    case "TASK_CREATED":
      return { label: "created a task", color: "text-emerald-400" };
    case "TASK_UPDATED":
      return { label: "updated a task", color: "text-sky-400" };
    case "TASK_DELETED":
      return { label: "deleted a task", color: "text-rose-400" };
    case "COMMENT_ADDED":
      return { label: "added a comment", color: "text-violet-400" };
    default:
      return { label: type, color: "text-slate-400" };
  }
}

function relativeTime(iso: string) {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const sec = Math.round(diff / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);

  if (sec < 45) return "just now";
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}