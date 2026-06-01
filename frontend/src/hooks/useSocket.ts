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

    socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
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
