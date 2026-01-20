import { Server } from "socket.io";
import { createServer } from "http";

let io = null;
let httpServer = null;

export function initializeWebSocket(app) {
  httpServer = createServer(app);
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });

    // Subscribe to Spotify updates
    socket.on("subscribe:spotify", () => {
      socket.join("spotify");
      console.log(`[WebSocket] Client ${socket.id} subscribed to Spotify updates`);
    });

    socket.on("unsubscribe:spotify", () => {
      socket.leave("spotify");
      console.log(`[WebSocket] Client ${socket.id} unsubscribed from Spotify updates`);
    });

    // Subscribe to Hive updates
    socket.on("subscribe:hive", () => {
      socket.join("hive");
      console.log(`[WebSocket] Client ${socket.id} subscribed to Hive updates`);
    });

    socket.on("unsubscribe:hive", () => {
      socket.leave("hive");
      console.log(`[WebSocket] Client ${socket.id} unsubscribed from Hive updates`);
    });
  });

  return { io, httpServer };
}

export function getIO() {
  if (!io) {
    throw new Error("WebSocket server not initialized. Call initializeWebSocket first.");
  }
  return io;
}

export function getHttpServer() {
  if (!httpServer) {
    throw new Error("HTTP server not initialized. Call initializeWebSocket first.");
  }
  return httpServer;
}
