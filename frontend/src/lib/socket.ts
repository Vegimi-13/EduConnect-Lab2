import { io, type Socket } from "socket.io-client";

import { useAuthStore } from "@/features/auth/store/authStore";

let socket: Socket | null = null;
let socketToken: string | null = null;

function getSocketUrl() {
  const configuredUrl = import.meta.env.VITE_SOCKET_URL as string | undefined;

  if (configuredUrl) {
    return configuredUrl;
  }

  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;

  if (apiUrl) {
    return apiUrl.replace(/\/api\/?$/, "");
  }

  return window.location.origin;
}

export function getSocket() {
  const token = useAuthStore.getState().accessToken;

  if (!socket) {
    socket = io(getSocketUrl(), {
      autoConnect: false,
      withCredentials: true,
      auth: {
        token,
      },
    });
    socketToken = token;
  }

  if (socketToken !== token) {
    socket.disconnect();
    socketToken = token;
  }

  socket.auth = {
    token,
  };

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
  socketToken = null;
}
