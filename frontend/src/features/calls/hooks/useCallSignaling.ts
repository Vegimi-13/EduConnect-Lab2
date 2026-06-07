import { useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket";

export type CallSignalingEvent =
  | { type: "incoming"; conversationId: number; callerId: number }
  | { type: "accepted"; conversationId: number }
  | { type: "rejected"; conversationId: number }
  | { type: "ended"; conversationId: number };

interface UseCallSignalingOptions {
  onEvent: (event: CallSignalingEvent) => void;
}

export function useCallSignaling({ onEvent }: UseCallSignalingOptions) {
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    const socket = getSocket();

    const handleIncoming = (data: { conversation_id: number; caller_id: number }) =>
      onEventRef.current({ type: "incoming", conversationId: data.conversation_id, callerId: data.caller_id });

    const handleAccepted = (data: { conversation_id: number }) =>
      onEventRef.current({ type: "accepted", conversationId: data.conversation_id });

    const handleRejected = (data: { conversation_id: number }) =>
      onEventRef.current({ type: "rejected", conversationId: data.conversation_id });

    const handleEnded = (data: { conversation_id: number }) =>
      onEventRef.current({ type: "ended", conversationId: data.conversation_id });

    socket.on("call_incoming", handleIncoming);
    socket.on("call_was_accepted", handleAccepted);
    socket.on("call_was_rejected", handleRejected);
    socket.on("call_was_ended", handleEnded);

    return () => {
      socket.off("call_incoming", handleIncoming);
      socket.off("call_was_accepted", handleAccepted);
      socket.off("call_was_rejected", handleRejected);
      socket.off("call_was_ended", handleEnded);
    };
  }, []);

  const socket = getSocket();

  return {
    inviteCall: (conversationId: number) =>
      socket.emit("call_invite", { conversation_id: conversationId }),
    acceptCall: (conversationId: number) =>
      socket.emit("call_accepted", { conversation_id: conversationId }),
    rejectCall: (conversationId: number) =>
      socket.emit("call_rejected", { conversation_id: conversationId }),
    endCall: (conversationId: number) =>
      socket.emit("call_ended", { conversation_id: conversationId }),
  };
}
