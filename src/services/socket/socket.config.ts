import { io, type Socket } from "socket.io-client";
import type { SocketClientEvents, SocketServerEvents } from "@/services/socket/socket.types";

type ChatSocket = Socket<SocketServerEvents, SocketClientEvents>;

let socket: ChatSocket | null = null;
let currentToken = "";

export function connectSocket(accessToken: string): ChatSocket {
  if (socket && currentToken === accessToken) {
    if (!socket.connected) socket.connect();
    return socket;
  }

  disconnectSocket();
  currentToken = accessToken;
  const serverUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, "").replace(/\/$/, "") ?? "";
  socket = io(serverUrl, { auth: { token: accessToken } });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
  currentToken = "";
}
