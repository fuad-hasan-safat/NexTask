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

  if (isLoading) {
    return <div className="text-slate-400">Loading notifications...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-slate-400 text-sm">No notifications yet</div>;
  }

  return (
    <div className="max-w-2xl space-y-3">
      <h1 className="text-lg font-semibold mb-3">Notifications</h1>

      {data.map((n: Notification) => (
        <div
          key={n._id}
          className={`border rounded-lg px-4 py-3 ${
            n.read
              ? "border-slate-800 bg-slate-900"
              : "border-indigo-600 bg-indigo-950"
          }`}
          onClick={() => {
            if (!n.read) mutate(n._id);
          }}
        >
          <div className="text-sm">{n.message}</div>

          <div className="text-xs text-slate-400 mt-1">
            {new Date(n.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
