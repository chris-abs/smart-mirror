import { io, Socket } from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_BASE, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    socket.on("connect", () => {
      console.log("[WebSocket] Connected to server");
    });

    socket.on("disconnect", () => {
      console.log("[WebSocket] Disconnected from server");
    });

    socket.on("connect_error", (error) => {
      console.error("[WebSocket] Connection error:", error);
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
