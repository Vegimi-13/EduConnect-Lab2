import { useEffect, useRef, useState, useCallback } from "react";
import {
  Room,
  RoomEvent,
  Track,
  Participant,
  RemoteParticipant,
  LocalParticipant,
  createLocalVideoTrack,
  createLocalAudioTrack,
  createLocalScreenTracks,
  LocalTrackPublication,
} from "livekit-client";
import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, PhoneOff } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParticipantState {
  participant: Participant;
  videoTrack: Track | null;
  isSpeaking: boolean;
  isCameraOn: boolean;
  isMicOn: boolean;
}

interface ParticipantMeta {
  name: string;
  avatarUrl?: string;
}

interface CallOverlayProps {
  token: string;
  wsUrl: string;
  roomName: string;
  participantMeta: Record<string, ParticipantMeta>;
  onEnd: () => void;
}

// ─── Participant Tile ─────────────────────────────────────────────────────────

function ParticipantTile({
  state,
  meta,
  isLocal,
}: {
  state: ParticipantState;
  meta?: ParticipantMeta;
  isLocal: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!state.videoTrack || !videoRef.current) return;
    state.videoTrack.attach(videoRef.current);
    return () => { state.videoTrack?.detach(); };
  }, [state.videoTrack]);

  const initials = (meta?.name ?? "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`relative flex min-w-0 flex-1 overflow-hidden rounded-2xl bg-[#101820] transition-all duration-150 ${
        state.isSpeaking
          ? "ring-2 ring-green-500 ring-offset-2 ring-offset-black"
          : "ring-2 ring-transparent"
      }`}
    >
      {/* Video */}
      {state.isCameraOn && state.videoTrack ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`h-full w-full object-cover ${isLocal ? "-scale-x-100" : ""}`}
        />
      ) : (
        /* Avatar fallback */
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#101820] to-[#1a2535]">
          {meta?.avatarUrl ? (
            <img
              src={meta.avatarUrl}
              alt={meta.name}
              className="size-24 rounded-full border-2 border-white/10 object-cover"
            />
          ) : (
            <div className="flex size-24 items-center justify-center rounded-full bg-[#073f43] text-3xl font-bold text-white/80">
              {initials}
            </div>
          )}
        </div>
      )}

      {/* Speaking pulse ring */}
      {state.isSpeaking && (
        <div className="pointer-events-none absolute inset-0 animate-pulse rounded-2xl ring-2 ring-green-500/40" />
      )}

      {/* Name bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
        {!state.isMicOn && <MicOff className="size-3.5 shrink-0 text-red-400" />}
        <span className="truncate text-sm font-medium text-white/90">
          {meta?.name ?? state.participant.identity}
          {isLocal && <span className="ml-1 text-white/40">(you)</span>}
        </span>
      </div>
    </div>
  );
}

// ─── Control Button ───────────────────────────────────────────────────────────

function ControlBtn({
  active = true,
  danger = false,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex size-12 items-center justify-center rounded-full transition active:scale-95 ${
        danger
          ? "bg-red-600 text-white shadow-lg shadow-red-900/40 hover:bg-red-700"
          : active
          ? "bg-white/15 text-white hover:bg-white/25"
          : "bg-white/5 text-white/40 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Main Overlay ─────────────────────────────────────────────────────────────

export default function CallOverlay({
  token,
  wsUrl,
  roomName,
  participantMeta,
  onEnd,
}: CallOverlayProps) {
  const roomRef = useRef<Room | null>(null);
  const [participants, setParticipants] = useState<Map<string, ParticipantState>>(new Map());
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connected, setConnected] = useState(false);
  const onEndRef = useRef(onEnd);

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  // ── Sync a participant's state into the map ──────────────────────────────
  const syncParticipant = useCallback((p: Participant) => {
    setParticipants((prev) => {
      const next = new Map(prev);
      const videoPub =
        p.getTrackPublication(Track.Source.Camera) ??
        p.getTrackPublication(Track.Source.ScreenShare);
      const audioPub = p.getTrackPublication(Track.Source.Microphone);

      next.set(p.identity, {
        participant: p,
        videoTrack: videoPub?.track ?? null,
        isSpeaking: p.isSpeaking,
        isCameraOn: !!(videoPub && !videoPub.isMuted),
        isMicOn: !!(audioPub && !audioPub.isMuted),
      });
      return next;
    });
  }, []);

  const removeParticipant = useCallback((p: Participant) => {
    setParticipants((prev) => {
      const next = new Map(prev);
      next.delete(p.identity);
      return next;
    });
  }, []);

  // ── Connect ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const room = new Room({ adaptiveStream: true, dynacast: true });
    let isMounted = true;
    roomRef.current = room;

    room
      .on(RoomEvent.ParticipantConnected, (p: RemoteParticipant) => syncParticipant(p))
      .on(RoomEvent.ParticipantDisconnected, (p: RemoteParticipant) => removeParticipant(p))
      .on(RoomEvent.TrackSubscribed, (_t, _p, p) => syncParticipant(p))
      .on(RoomEvent.TrackUnsubscribed, (_t, _p, p) => syncParticipant(p))
      .on(RoomEvent.TrackMuted, (_p, p) => syncParticipant(p))
      .on(RoomEvent.TrackUnmuted, (_p, p) => syncParticipant(p))
      .on(RoomEvent.LocalTrackPublished, () => syncParticipant(room.localParticipant))
      .on(RoomEvent.LocalTrackUnpublished, () => syncParticipant(room.localParticipant))
      .on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const speakerIds = new Set(speakers.map((s) => s.identity));
        setParticipants((prev) => {
          const next = new Map(prev);
          next.forEach((state, id) =>
            next.set(id, { ...state, isSpeaking: speakerIds.has(id) })
          );
          return next;
        });
      })
      .on(RoomEvent.Connected, () => {
        if (!isMounted) return;
        setConnected(true);
        syncParticipant(room.localParticipant);
        room.remoteParticipants.forEach((p) => syncParticipant(p));
      })
      .on(RoomEvent.Disconnected, () => {
        setConnected(false);
      });

    room.connect(wsUrl, token)
      .then(async () => {
        if (!isMounted) return;
        const micTrack = await createLocalAudioTrack();
        if (!isMounted || room.state === "disconnected") {
          micTrack.stop();
          return;
        }
        await room.localParticipant.publishTrack(micTrack);
        syncParticipant(room.localParticipant);
      })
      .catch((error) => {
        if (!isMounted) return;

        const message = error instanceof Error ? error.message : String(error);
        if (message.toLowerCase().includes("client initiated disconnect")) {
          return;
        }

        console.error("Failed to connect to LiveKit room:", error);
      });

    return () => {
      isMounted = false;
      if (roomRef.current === room) {
        roomRef.current = null;
      }
      room.disconnect();
    };
  }, [removeParticipant, syncParticipant, token, wsUrl]);

  // ── Controls ─────────────────────────────────────────────────────────────
  const toggleCamera = async () => {
    const lp = roomRef.current?.localParticipant;
    if (!lp) return;
    if (isCameraOn) {
      const pub = lp.getTrackPublication(Track.Source.Camera);
      if (pub) await lp.unpublishTrack((pub as LocalTrackPublication).track!);
      setIsCameraOn(false);
    } else {
      const track = await createLocalVideoTrack({ facingMode: "user" });
      await lp.publishTrack(track);
      setIsCameraOn(true);
    }
    syncParticipant(lp);
  };

  const toggleMic = async () => {
    const lp = roomRef.current?.localParticipant;
    if (!lp) return;
    const pub = lp.getTrackPublication(Track.Source.Microphone);
    if (pub) {
      if (isMicOn) {
        await pub.mute();
      } else {
        await pub.unmute();
      }
      setIsMicOn((v) => !v);
    }
    syncParticipant(lp);
  };

  const toggleScreenShare = async () => {
    const lp = roomRef.current?.localParticipant;
    if (!lp) return;
    if (isScreenSharing) {
      const pub = lp.getTrackPublication(Track.Source.ScreenShare);
      if (pub) await lp.unpublishTrack((pub as LocalTrackPublication).track!);
      setIsScreenSharing(false);
    } else {
      try {
        const [track] = await createLocalScreenTracks({ audio: false });
        await lp.publishTrack(track);
        setIsScreenSharing(true);
        track.mediaStreamTrack.addEventListener("ended", () => {
          lp.unpublishTrack(track);
          setIsScreenSharing(false);
        });
      } catch {
        // user cancelled picker
      }
    }
    syncParticipant(lp);
  };

  const hangUp = () => {
    const room = roomRef.current;
    roomRef.current = null;
    room?.disconnect();
    onEndRef.current();
  };

  const tiles = Array.from(participants.values());

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#0a0f14] font-sans">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-white/5 px-6 py-4">
        <div
          className={`size-2 rounded-full ${
            connected ? "bg-green-500 shadow-[0_0_6px_theme(colors.green.500)]" : "bg-amber-400"
          }`}
        />
        <span className="text-xs text-white/40">
          {connected ? roomName : "Connecting…"}
        </span>
      </div>

      {/* Tiles */}
      <div className="flex flex-1 gap-3 overflow-hidden p-4">
        {tiles.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-sm text-white/30">
            Waiting for others to join…
          </div>
        ) : (
          tiles.map((state) => (
            <ParticipantTile
              key={state.participant.identity}
              state={state}
              meta={participantMeta[state.participant.identity]}
              isLocal={state.participant instanceof LocalParticipant}
            />
          ))
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 border-t border-white/5 py-5">
        <ControlBtn active={isMicOn} onClick={toggleMic} title={isMicOn ? "Mute" : "Unmute"}>
          {isMicOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
        </ControlBtn>

        <ControlBtn active={isCameraOn} onClick={toggleCamera} title={isCameraOn ? "Camera off" : "Camera on"}>
          {isCameraOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
        </ControlBtn>

        <ControlBtn active={isScreenSharing} onClick={toggleScreenShare} title={isScreenSharing ? "Stop sharing" : "Share screen"}>
          {isScreenSharing ? <MonitorOff className="size-5" /> : <Monitor className="size-5" />}
        </ControlBtn>

        <ControlBtn danger onClick={hangUp} title="End call">
          <PhoneOff className="size-5" />
        </ControlBtn>
      </div>
    </div>
  );
}
