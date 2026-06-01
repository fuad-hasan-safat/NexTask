import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: {
        token: localStorage.getItem("accessToken"),
      },
      transports: ["websocket"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("✅ frontend socket connected:", socket!.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ frontend socket disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("❌ socket connect error:", err.message);
    });
  }

  return socket;
};
