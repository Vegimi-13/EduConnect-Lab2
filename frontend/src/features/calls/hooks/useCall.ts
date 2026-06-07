import { useState, useCallback, useRef } from "react";
import livekitApi from "../api/livekitApi";
import { useCallSignaling } from "./useCallSignaling";

export type CallState =
  | { phase: "idle" }
  | { phase: "calling"; conversationId: number }
  | { phase: "incoming"; conversationId: number; callerId: number }
  | { phase: "connected"; conversationId: number; token: string; wsUrl: string; roomName: string };

export function useCall() {
  const [callState, setCallState] = useState<CallState>({ phase: "idle" });

  // Store pending token so caller can join once callee accepts
  const pendingRef = useRef<{
    conversationId: number;
    token: string;
    wsUrl: string;
    roomName: string;
  } | null>(null);

  const { inviteCall, acceptCall, rejectCall, endCall } = useCallSignaling({
    onEvent: useCallback((event) => {
      switch (event.type) {
        case "incoming":
          setCallState((prev) =>
            prev.phase === "idle"
              ? { phase: "incoming", conversationId: event.conversationId, callerId: event.callerId }
              : prev
          );
          break;

        case "accepted":
          // Callee accepted — we (the caller) can now join using the token we pre-fetched
          if (pendingRef.current) {
            const p = pendingRef.current;
            setCallState({
              phase: "connected",
              conversationId: p.conversationId,
              token: p.token,
              wsUrl: p.wsUrl,
              roomName: p.roomName,
            });
            pendingRef.current = null;
          }
          break;

        case "rejected":
          pendingRef.current = null;
          setCallState((prev) => (prev.phase === "calling" ? { phase: "idle" } : prev));
          break;

        case "ended":
          pendingRef.current = null;
          setCallState({ phase: "idle" });
          break;
      }
    }, []),
  });

  const initiateCall = useCallback(
    async (conversationId: number) => {
      if (callState.phase !== "idle") return;
      try {
        const { token, wsUrl, roomName } = await livekitApi.getPrivateCallToken(conversationId);
        pendingRef.current = { conversationId, token, wsUrl, roomName };
        setCallState({ phase: "calling", conversationId });
        inviteCall(conversationId);
      } catch (err) {
        console.error("Failed to initiate call:", err);
      }
    },
    [callState.phase, inviteCall]
  );

  const handleAccept = useCallback(
    async (conversationId: number) => {
      try {
        const { token, wsUrl, roomName } = await livekitApi.getPrivateCallToken(conversationId);
        acceptCall(conversationId);
        setCallState({ phase: "connected", conversationId, token, wsUrl, roomName });
      } catch (err) {
        console.error("Failed to accept call:", err);
      }
    },
    [acceptCall]
  );

  const handleReject = useCallback(
    (conversationId: number) => {
      rejectCall(conversationId);
      setCallState({ phase: "idle" });
    },
    [rejectCall]
  );

  const handleEnd = useCallback(() => {
    if (callState.phase === "connected") {
      endCall(callState.conversationId);
    }
    pendingRef.current = null;
    setCallState({ phase: "idle" });
  }, [callState, endCall]);

  const cancelCall = useCallback(() => {
    if (callState.phase === "calling") {
      endCall(callState.conversationId);
    }
    pendingRef.current = null;
    setCallState({ phase: "idle" });
  }, [callState, endCall]);

  return { callState, initiateCall, handleAccept, handleReject, handleEnd, cancelCall };
}