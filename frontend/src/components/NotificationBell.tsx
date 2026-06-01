import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchNotificationsApi } from "../api/notificationApi";
import { useSocket } from "../hooks/useSocket";

export default function NotificationBell() {
  const qc = useQueryClient();
  const socket = useSocket();

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotificationsApi,
  });

  const unreadCount = notifications?.filter((n: any) => !n.read).length ?? 0;

  useEffect(() => {
    if (!socket) return;

    const handler = () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    };

    socket.on("notification:new", handler);

    return () => {
      socket.off("notification:new", handler);
    };
  }, [socket, qc]);

  return (
    <div className="relative">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"
        />
      </svg>

      {unreadCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white ring-2 ring-slate-950">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </div>
  );
}