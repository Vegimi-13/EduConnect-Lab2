import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Hash, MessageSquare, Search, Send, UsersRound } from "lucide-react";

import { useAuthStore } from "@/features/auth/store/authStore";
import { getSocket } from "@/lib/socket";

import { groupsApi } from "../api/groupsApi";
import type {
  ChannelJoinedPayload,
  ChannelMessage,
  ChannelMessagePayload,
  Group,
  GroupChannel,
  GroupMember,
} from "../types/groups.types";
import { Avatar } from "./Avatar";

type ChannelTypingPayload = {
  user_id: number;
  channel_id: number;
  conversation_id: number;
};

const EMPTY_CHANNELS: GroupChannel[] = [];
const EMPTY_MEMBERS: GroupMember[] = [];

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatMessageTime(date: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}
export function ChannelsTab({ group }: { group: Group }) {
  const groupId = group.id;
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const typingTimeoutRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [typingUserIds, setTypingUserIds] = useState<Set<number>>(new Set());
  const [connectionState, setConnectionState] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [socketError, setSocketError] = useState<string | null>(null);

  const channelsQuery = useQuery({
    queryKey: ["groups", groupId, "channels"],
    queryFn: () => groupsApi.getGroupChannels(groupId),
    retry: false,
  });
  const membersQuery = useQuery({
    queryKey: ["groups", groupId, "members"],
    queryFn: () => groupsApi.getGroupMembers(groupId),
    retry: false,
  });

  const channels = channelsQuery.data ?? EMPTY_CHANNELS;
  const members = membersQuery.data ?? EMPTY_MEMBERS;

  const selectedChannel = useMemo<GroupChannel | undefined>(
    () => channels.find((c) => c.id === selectedChannelId) ?? channels[0],
    [channels, selectedChannelId]
  );

  const memberNameById = useMemo(
    () => new Map(members.map((m) => [m.user_id, `${m.user.first_name} ${m.user.last_name}`.trim()])),
    [members]
  );

  const typingNames = useMemo(
    () =>
      Array.from(typingUserIds)
        .filter((uid) => uid !== currentUserId)
        .map((uid) => memberNameById.get(uid) ?? "Someone"),
    [currentUserId, memberNameById, typingUserIds]
  );

  const currentUserLabel = currentUser?.email ?? "Signed-in user";
  const currentUserInitials = getInitials(currentUserLabel) || "U";

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selectedChannel) {
      const t = window.setTimeout(() => { setMessages([]); setConnectionState("idle"); }, 0);
      return () => window.clearTimeout(t);
    }

    let isActive = true;
    const channel = selectedChannel;
    const socket = getSocket();

    queueMicrotask(() => {
      if (!isActive) return;
      setMessages([]);
      setMessageDraft("");
      setSocketError(null);
      setConnectionState("connecting");
      setTypingUserIds(new Set());
    });

    function handleChannelJoined(payload: ChannelJoinedPayload) {
      if (!isActive || payload.channel_id !== channel.id) return;
      setMessages(payload.messages);
      setConnectionState("connected");
    }
    function handleNewChannelMessage(payload: ChannelMessagePayload) {
      if (!isActive || payload.channel_id !== channel.id) return;
      setTypingUserIds((s) => {
        if (!s.has(payload.message.sender_id)) return s;
        const n = new Set(s); n.delete(payload.message.sender_id); return n;
      });
      setMessages((m) => m.some((x) => x.id === payload.message.id) ? m : [...m, payload.message]);
      setConnectionState("connected");
    }
    function handleChannelTyping(payload: ChannelTypingPayload) {
      if (!isActive || payload.channel_id !== channel.id || payload.user_id === currentUserId) return;
      setTypingUserIds((s) => { const n = new Set(s); n.add(payload.user_id); return n; });
    }
    function handleChannelStopTyping(payload: ChannelTypingPayload) {
      if (!isActive || payload.channel_id !== channel.id) return;
      setTypingUserIds((s) => { if (!s.has(payload.user_id)) return s; const n = new Set(s); n.delete(payload.user_id); return n; });
    }
    function handleException(message: string) {
      if (!isActive) return;
      setSocketError(String(message));
      setConnectionState("error");
    }
    function handleConnectError(error: Error) {
      if (!isActive) return;
      setSocketError(error.message);
      setConnectionState("error");
    }

    socket.on("channel_joined", handleChannelJoined);
    socket.on("new_channel_message", handleNewChannelMessage);
    socket.on("channel_user_typing", handleChannelTyping);
    socket.on("channel_user_stop_typing", handleChannelStopTyping);
    socket.on("exception", handleException);
    socket.on("connect_error", handleConnectError);
    socket.emit("join_channel", { channel_id: channel.id });

    return () => {
      isActive = false;
      socket.off("channel_joined", handleChannelJoined);
      socket.off("new_channel_message", handleNewChannelMessage);
      socket.off("channel_user_typing", handleChannelTyping);
      socket.off("channel_user_stop_typing", handleChannelStopTyping);
      socket.off("exception", handleException);
      socket.off("connect_error", handleConnectError);
      if (socket.connected) socket.emit("leave_channel", { channel_id: channel.id });
    };
  }, [currentUserId, selectedChannel]);

  useEffect(() => () => { if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current); }, []);

  function emitStopTyping(channelId: number) {
    getSocket().emit("channel_stop_typing", { channel_id: channelId });
  }

  function handleMessageDraftChange(value: string) {
    setMessageDraft(value);
    if (!selectedChannel) return;
    getSocket().emit("channel_typing", { channel_id: selectedChannel.id });
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => {
      emitStopTyping(selectedChannel.id);
      typingTimeoutRef.current = null;
    }, 1200);
  }

  function handleSendChannelMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedChannel || !messageDraft.trim()) return;
    getSocket().emit("send_channel_message", {
      channel_id: selectedChannel.id,
      content: messageDraft.trim(),
      message_type: "text",
    });
    emitStopTyping(selectedChannel.id);
    if (typingTimeoutRef.current) { window.clearTimeout(typingTimeoutRef.current); typingTimeoutRef.current = null; }
    setMessageDraft("");
  }

  if (channelsQuery.isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#d6dde3] bg-white p-5 shadow-sm">
        <p className="text-sm text-[#7a8e91]">Loading channels...</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d6dde3] bg-white shadow-sm">
      <div className="grid h-[calc(100dvh-14rem)] min-h-[36rem] overflow-hidden lg:grid-cols-[13rem_minmax(0,1fr)]"> 
             {/* Channel sidebar */}
        <aside className="flex flex-col border-r border-[#edf3fb] bg-[#f8fafc]">
          <div className="border-b border-[#edf3fb] px-4 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#7a8e91]">Channels</p>
            <p className="mt-1 text-sm font-semibold text-[#101820]">
              {channels.length} {channels.length === 1 ? "space" : "spaces"}
            </p>
          </div>

          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
            {channels.length ? (
              channels.map((channel) => {
                const isActive = channel.id === selectedChannel?.id;
                return (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => setSelectedChannelId(channel.id)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition ${
                      isActive
                        ? "bg-[#073f43] text-white shadow-sm"
                        : "text-[#3d5156] hover:bg-white"
                    }`}
                  >
                    <Hash className="size-3.5 shrink-0" />
                    <span className="block min-w-0 truncate text-sm font-semibold">{channel.name}</span>
                    {isActive && <ChevronRight className="ml-auto size-3.5 shrink-0 opacity-60" />}
                  </button>
                );
              })
            ) : (
              <p className="rounded-xl border border-dashed border-[#c8d1d7] bg-white px-3 py-4 text-center text-xs text-[#7a8e91]">
                No channels yet
              </p>
            )}
          </div>

          {/* Current user footer */}
          <div className="border-t border-[#edf3fb] bg-white px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Avatar initials={currentUserInitials} size="sm" />
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white bg-emerald-500" />
              </div>
              <div className="min-w-0">
                <p className="max-w-[7rem] truncate text-xs font-bold text-[#101820]">{currentUserLabel}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">Online</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Chat area */}
        <section className="flex min-h-0 flex-col bg-white">
          {/* Channel header */}
          <div className="flex items-center justify-between gap-4 border-b border-[#edf3fb] px-5 py-3.5">
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 text-base font-bold text-[#101820]">
                <Hash className="size-4 text-[#073f43]" />
                {selectedChannel?.name ?? "channels"}
              </h2>
              {selectedChannel?.description ? (
                <p className="mt-0.5 truncate text-xs text-[#7a8e91]">{selectedChannel.description}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold md:flex ${
                  connectionState === "connected" ? "bg-emerald-50 text-emerald-700"
                  : connectionState === "error" ? "bg-red-50 text-red-700"
                  : "bg-[#f3f6fb] text-[#7a8e91]"
                }`}
              >
                <span className={`size-1.5 rounded-full ${
                  connectionState === "connected" ? "bg-emerald-500"
                  : connectionState === "error" ? "bg-red-500"
                  : "bg-[#c8d1d7]"
                }`} />
                {connectionState}
              </span>
              <button className="flex size-8 items-center justify-center rounded-lg text-[#7a8e91] transition hover:bg-[#f3f6fb] hover:text-[#073f43]">
                <Search className="size-4" />
              </button>
              <button className="flex size-8 items-center justify-center rounded-lg text-[#7a8e91] transition hover:bg-[#f3f6fb] hover:text-[#073f43]">
                <UsersRound className="size-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="min-h-0 flex-1 overflow-y-auto bg-[#f8fafc] px-5 py-5">
            {socketError ? (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {socketError}
              </div>
            ) : null}

            {connectionState === "connecting" ? (
              <div className="rounded-xl border border-[#d6dde3] bg-white px-4 py-3 text-sm text-[#7a8e91]">
                Joining channel...
              </div>
            ) : null}

            {messages.length ? (
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwn = message.sender_id === currentUserId;
                  return (
                    <div
                      key={message.id}
                      className={`flex items-end gap-3 ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      {!isOwn && (
                        <Avatar
                          initials={`${message.sender.first_name[0]}${message.sender.last_name[0]}`}
                          size="sm"
                        />
                      )}
                      <div
                        className={`max-w-[min(42rem,78%)] rounded-2xl px-4 py-3 shadow-sm ${
                          isOwn
                            ? "rounded-br-md bg-[#073f43] text-white"
                            : "rounded-bl-md border border-[#e8eff6] bg-white text-[#101820]"
                        }`}
                      >
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <p className="text-sm font-bold">
                            {isOwn ? "You" : `${message.sender.first_name} ${message.sender.last_name}`}
                          </p>
                          <span className={`text-xs ${isOwn ? "text-white/60" : "text-[#7a8e91]"}`}>
                            {formatMessageTime(message.created_at)}
                          </span>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            ) : connectionState !== "connecting" ? (
              <div className="flex h-full min-h-72 items-center justify-center">
                <div className="rounded-2xl border border-dashed border-[#c8d1d7] bg-white px-8 py-10 text-center">
                  <MessageSquare className="mx-auto size-10 text-[#073f43]/40" />
                  <h3 className="mt-4 text-base font-semibold text-[#101820]">No messages yet</h3>
                  <p className="mt-2 text-sm leading-6 text-[#7a8e91]">
                    Start the first discussion in this channel.
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Typing indicator */}
          {typingNames.length ? (
            <div className="border-t border-[#edf3fb] bg-white px-5 py-2 text-xs font-medium text-[#7a8e91]">
              {typingNames.length === 1
                ? `${typingNames[0]} is typing...`
                : `${typingNames.slice(0, 2).join(", ")} are typing...`}
            </div>
          ) : null}

          {/* Message input */}
          <form className="border-t border-[#edf3fb] bg-white p-4" onSubmit={handleSendChannelMessage}>
            <div className="flex items-center gap-3 rounded-2xl border border-[#d6dde3] bg-[#f8fafc] px-4 py-2.5 transition focus-within:border-[#073f43] focus-within:ring-2 focus-within:ring-[#073f43]/10">
              <input
                className="min-h-8 flex-1 bg-transparent text-sm outline-none placeholder:text-[#aab7ba]"
                placeholder={`Message #${selectedChannel?.name ?? "channel"}`}
                value={messageDraft}
                onChange={(e) => handleMessageDraftChange(e.target.value)}
                disabled={!selectedChannel}
              />
              <button
                type="submit"
                disabled={!selectedChannel || !messageDraft.trim()}
                className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#073f43] text-white transition hover:bg-[#052c2f] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}


// ─── Page ─────────────────────────────────────────────────────────────────────
