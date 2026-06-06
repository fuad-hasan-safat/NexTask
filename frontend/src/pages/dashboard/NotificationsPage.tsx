import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotificationsApi,
  markNotificationReadApi,
  type Notification,
} from "../../api/notificationApi";

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotificationsApi,
  });

  const { mutate } = useMutation({
    mutationFn: (id: string) => markNotificationReadApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount = data?.filter((n: Notification) => !n.read).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-white">Notifications</h1>
        {unreadCount > 0 && (
          <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-xs font-medium text-indigo-300">
            {unreadCount} new
          </span>
        )}
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
      ) : !data || data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-6 py-16 text-center">
          <p className="text-sm font-medium text-slate-300">No notifications yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Assignments, comments, and team activity will show up here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {data.map((n: Notification) => (
            <li
              key={n._id}
              onClick={() => {
                if (!n.read) mutate(n._id);
              }}
              className={`cursor-pointer rounded-2xl border px-4 py-3 transition-colors ${
                n.read
                  ? "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                  : "border-indigo-500/40 bg-indigo-500/10 hover:border-indigo-500/60"
              }`}
            >
              <div className="flex items-start gap-3">
                {!n.read && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-100">{n.message}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
