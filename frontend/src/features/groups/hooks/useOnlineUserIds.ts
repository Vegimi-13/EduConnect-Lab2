import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

type PresenceSnapshotPayload = { user_ids: number[] };
type PresenceUserPayload = { user_id: number };

export function useOnlineUserIds() {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const socket = getSocket();

    function handlePresenceSnapshot(payload: PresenceSnapshotPayload) {
      setOnlineUserIds(new Set(payload.user_ids));
    }

    function handleUserOnline(payload: PresenceUserPayload) {
      setOnlineUserIds((s) => {
        const n = new Set(s);
        n.add(payload.user_id);
        return n;
      });
    }

    function handleUserOffline(payload: PresenceUserPayload) {
      setOnlineUserIds((s) => {
        const n = new Set(s);
        n.delete(payload.user_id);
        return n;
      });
    }

    socket.on("presence_snapshot", handlePresenceSnapshot);
    socket.on("presence_user_online", handleUserOnline);
    socket.on("presence_user_offline", handleUserOffline);
    socket.emit("presence:get");

    return () => {
      socket.off("presence_snapshot", handlePresenceSnapshot);
      socket.off("presence_user_online", handleUserOnline);
      socket.off("presence_user_offline", handleUserOffline);
    };
  }, []);

  return onlineUserIds;
}