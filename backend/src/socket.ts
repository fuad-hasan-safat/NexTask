import { Server as IOServer, Socket } from "socket.io";
import { verifyAccessToken } from "./utils/jwt";
import { corsOrigin } from "./config/env";

let io: IOServer | null = null;

export const initSocket = (server: any) => {
  io = new IOServer(server, {
    cors: {
      origin: corsOrigin, // set CORS_ORIGIN env var to restrict in production
      methods: ["GET", "POST"],
    },
  });

  // 🔐 Socket auth middleware
  io.use((socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ??
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const payload = verifyAccessToken(token);
      (socket as any).user = payload;

      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`🔌 socket connected: ${socket.id}, user: ${user.userId}`);

  socket.join(`user:${user.userId}`);

  console.log(
    "🔔 user room joined:",
    `user:${user.userId}`,
    "socket:",
    socket.id
  );

    socket.on("joinRoom", (room: string) => {
      console.log("JOIN ROOM (server):", room, "SOCKET:", socket.id);
      socket.join(room);
    });

    socket.on("leaveRoom", (room: string) => {
      socket.leave(room);
    });

    socket.on("disconnect", () => {
      console.log(`❌ socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): IOServer => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
