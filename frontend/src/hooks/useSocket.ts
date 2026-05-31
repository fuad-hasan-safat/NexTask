import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export const useSocket = () => {
  const ref = useRef<Socket | null>(null);

  useEffect(() => {
    if (socket) {
      ref.current = socket;
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    socket = io("https://nex-task-chi.vercel.app", {
      auth: { token },
      transports: ["websocket"],
    });

    ref.current = socket;

    return () => {
      // ❌ DO NOT disconnect globally
    };
  }, []);

  return ref.current;
};
