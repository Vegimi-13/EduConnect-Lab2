import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Phone, Search, Send, X, MessageSquare } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { messagesApi, type Conversation, type Message } from "../api/messagesApi";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/features/auth/store/authStore";
import { profileApi } from "@/features/profile/api/profileApi";
import { useCall } from "@/features/calls/hooks/useCall";
import CallOverlay from "@/features/calls/components/callOverlay";
import IncomingCallModal from "@/features/calls/components/IncomingCallModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return date.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });
  const days = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (days === 1) return "Yesterday";
  if (days < 7) return date.toLocaleDateString("en", { weekday: "short" });
  return date.toLocaleDateString("en", { month: "short", day: "numeric" });
}

function initials(firstName: string, lastName: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

function getOtherParticipant(conv: Conversation, myId: number | null) {
  if (myId === null) return undefined;
  return conv.conversation_participants.find((p) => Number(p.user_id) !== Number(myId))?.user;
}

function toFiniteNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function getErrorMessage(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  return "Could not start conversation.";
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "size-8 text-xs", md: "size-11 text-sm", lg: "size-12 text-base" };
  return (
    <div
      className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full bg-[#073f43] font-semibold text-white`}
    >
      {name}
    </div>
  );
}

// ─── New Conversation Modal ───────────────────────────────────────────────────

function NewConversationModal({
  onClose,
  onStart,
}: {
  onClose: () => void;
  onStart: (userId: number) => void;
}) {
  const [search, setSearch] = useState("");
  const { data: mutuals = [], isLoading } = useQuery({
    queryKey: ["mutualFollows"],
    queryFn: messagesApi.getMutualFollows,
  });

  const filtered = mutuals.filter((u) =>
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#edf0f2] px-5 py-4">
          <h2 className="font-semibold text-[#101820]">New Message</h2>
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-full transition hover:bg-[#f0f4f8]"
          >
            <X className="size-4 text-[#5a6b6d]" />
          </button>
        </div>

        <div className="px-5 py-3">
          <div className="flex items-center gap-2 rounded-lg bg-[#f5f7f9] px-3 py-2">
            <Search className="size-4 text-[#8a9a9c]" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search connections..."
              className="flex-1 bg-transparent text-sm text-[#101820] outline-none placeholder:text-[#8a9a9c]"
            />
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto px-2 pb-3">
          {isLoading ? (
            <div className="space-y-1 px-3 py-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg px-2 py-2.5">
                  <div className="size-10 animate-pulse rounded-full bg-[#e4eaf0]" />
                  <div className="h-4 w-32 animate-pulse rounded bg-[#e4eaf0]" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-[#8a9a9c]">
              {mutuals.length === 0 ? "No mutual connections yet." : "No results found."}
            </p>
          ) : (
            filtered.map((user) => (
              <button
                key={user.id}
                onClick={() => onStart(user.id)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[#f0f5fb]"
              >
                <Avatar name={initials(user.first_name, user.last_name)} size="sm" />
                <span className="text-sm font-medium text-[#101820]">
                  {user.first_name} {user.last_name}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Conversation List Item ───────────────────────────────────────────────────

function ConversationItem({
  conv,
  myId,
  isActive,
  onClick,
}: {
  conv: Conversation;
  myId: number | null;
  isActive: boolean;
  onClick: () => void;
}) {
  const other = getOtherParticipant(conv, myId);
  const lastMsg = conv.messages[0];
  const name = other ? `${other.first_name} ${other.last_name}` : conv.name ?? "Group";
  const abbr = other ? initials(other.first_name, other.last_name) : "?";

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
        isActive ? "bg-[#e8f0f1]" : "hover:bg-[#f5f7f9]"
      }`}
    >
      <Avatar name={abbr} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-1">
          <span className="truncate text-sm font-semibold text-[#101820]">{name}</span>
          {lastMsg && (
            <span className="shrink-0 text-xs text-[#8a9a9c]">
              {formatTime(lastMsg.created_at)}
            </span>
          )}
        </div>
        {lastMsg && (
          <p className="mt-0.5 truncate text-xs text-[#5a6b6d]">
            {Number(lastMsg.sender_id) === Number(myId) ? "You: " : ""}
            {lastMsg.content ?? "Sent an attachment"}
          </p>
        )}
      </div>
    </button>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg, isMine }: { msg: Message; isMine: boolean }) {
  return (
    <div className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
      {!isMine && (
        <Avatar name={initials(msg.sender.first_name, msg.sender.last_name)} size="sm" />
      )}
      <div className={`flex flex-col gap-1 ${isMine ? "items-end" : "items-start"}`}>
        {msg.reply_to_message && (
          <div className="rounded-lg border border-[#dde4e8] bg-[#f5f7f9] px-3 py-1.5 text-xs text-[#5a6b6d]">
            <span className="font-medium">{msg.reply_to_message.sender.first_name}: </span>
            {msg.reply_to_message.content}
          </div>
        )}
        <div
          className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isMine
              ? "rounded-br-sm bg-[#073f43] text-white"
              : "rounded-bl-sm bg-[#f0f4f8] text-[#101820]"
          }`}
        >
          {msg.content}
        </div>
        <span className="text-[10px] text-[#8a9a9c]">{formatTime(msg.created_at)}</span>
      </div>
    </div>
  );
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────

function ChatPanel({
  conversation,
  myId,
  onCall,
}: {
  conversation: Conversation;
  myId: number | null;
  onCall: () => void;
}) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", conversation.id],
    queryFn: () => messagesApi.getMessages(conversation.id),
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => messagesApi.sendMessage(conversation.id, content),
    onSuccess: (newMessage) => {
      queryClient.setQueryData(
        ["messages", conversation.id],
        (old: Message[]) => (old ? [...old, newMessage] : [newMessage])
      );
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  useEffect(() => {
    const socket = getSocket();
    socket.emit("join_conversation", { conversation_id: conversation.id });

    const handleNewMessage = (msg: Message) => {
      queryClient.setQueryData<Message[]>(["messages", conversation.id], (old) => {
        if (!old) return [msg];
        if (old.some((m) => m.id === msg.id)) return old;
        return [...old, msg];
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.emit("leave_conversation", { conversation_id: conversation.id });
    };
  }, [conversation.id, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    sendMutation.mutate(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const other = getOtherParticipant(conversation, myId);
  const name = other ? `${other.first_name} ${other.last_name}` : conversation.name ?? "Group";

  const grouped: { date: string; msgs: Message[] }[] = [];
  for (const msg of messages) {
    const date = new Date(msg.created_at).toDateString();
    const last = grouped[grouped.length - 1];
    if (last?.date === date) last.msgs.push(msg);
    else grouped.push({ date, msgs: [msg] });
  }

  function dateLabel(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return "Today";
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" });
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#dde4e8] px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={other ? initials(other.first_name, other.last_name) : "?"} size="md" />
          <div>
            <p className="font-semibold text-[#101820]">{name}</p>
          </div>
        </div>

        {/* Call button */}
        <button
          onClick={onCall}
          title="Start call"
          className="flex size-9 items-center justify-center rounded-lg text-[#5a6b6d] transition hover:bg-[#f0f4f8] hover:text-[#073f43]"
        >
          <Phone className="size-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
        {grouped.map(({ date, msgs }) => (
          <div key={date} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-[#edf0f2]" />
              <span className="text-xs font-medium text-[#8a9a9c]">{dateLabel(date)}</span>
              <div className="h-px flex-1 bg-[#edf0f2]" />
            </div>
            {msgs.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isMine={myId !== null && Number(msg.sender_id) === myId}
              />
            ))}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#dde4e8] px-4 py-3">
        <div className="flex items-end gap-3 rounded-2xl bg-[#f5f7f9] px-4 py-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write your message..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-[#101820] outline-none placeholder:text-[#8a9a9c]"
            style={{ maxHeight: 120 }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sendMutation.isPending}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#073f43] text-white transition hover:bg-[#062f33] disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-[#edf3fb]">
        <MessageSquare className="size-7 text-[#8a9a9c]" />
      </div>
      <div>
        <p className="font-semibold text-[#374445]">No conversation selected</p>
        <p className="mt-1 text-sm text-[#8a9a9c]">
          Pick an existing one or start a new message.
        </p>
      </div>
      <button
        onClick={onNew}
        className="rounded-lg bg-[#073f43] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#062f33]"
      >
        New Message
      </button>
    </div>
  );
}

// ─── Outgoing call modal ──────────────────────────────────────────────────────

function OutgoingCallModal({
  calleeName,
  onCancel,
}: {
  calleeName: string;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex w-64 flex-col items-center gap-5 rounded-2xl border border-[#dde4e8] bg-white px-8 py-8 shadow-2xl">
        <div className="flex size-16 animate-pulse items-center justify-center rounded-full bg-[#073f43]">
          <Phone className="size-7 text-white" />
        </div>
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-[#8a9a9c]">Calling…</p>
          <p className="mt-1 text-lg font-semibold text-[#101820]">{calleeName}</p>
        </div>
        <button
          onClick={onCancel}
          className="flex size-12 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition hover:bg-red-700 active:scale-95"
          title="Cancel"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function MessagesPage() {
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const { data: myProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: profileApi.getMyProfile,
    retry: false,
  });
  const myId = toFiniteNumber(currentUser?.id ?? myProfile?.user_id);
  const isLoadingIdentity = myId === null && isProfileLoading;

  const { callState, initiateCall, handleAccept, handleReject, handleEnd, cancelCall } = useCall();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: messagesApi.getConversations,
  });

  const createMutation = useMutation({
    mutationFn: messagesApi.createConversation,
    onSuccess: (conv) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setActiveConvId(conv.id);
      setShowNew(false);
    },
    onError: (err: unknown) => {
      alert(getErrorMessage(err));
    },
  });

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;

  const filtered =
    myId === null
      ? []
      : conversations.filter((conv) => {
          if (conv.type !== "private") return false;
          const other = getOtherParticipant(conv, myId);
          const name = other ? `${other.first_name} ${other.last_name}` : conv.name ?? "";
          return name.toLowerCase().includes(search.toLowerCase());
        });

  // Build participantMeta for call overlay.
  // AuthUser only has id + email, so we get names from conversation participants.
  const participantMeta: Record<string, { name: string; avatarUrl?: string }> = (() => {
    const meta: Record<string, { name: string; avatarUrl?: string }> = {};

    if (activeConv) {
      for (const p of activeConv.conversation_participants) {
        if (p.user) {
          const name = `${p.user.first_name} ${p.user.last_name}`.trim();
          meta[String(p.user_id)] = {
            name: name,
            avatarUrl:
              "profile_picture" in p.user && typeof p.user.profile_picture === "string"
                ? p.user.profile_picture
                : undefined,
          };
        }
      }
    }

    // Fallback for current user if not in participants (shouldn't happen, but safe)
    if (myId !== null && !meta[String(myId)]) {
      meta[String(myId)] = { name: currentUser?.email ?? myProfile?.email ?? "You" };
    }

    return meta;
  })();

  // Name of the other person in the active conversation (for outgoing/incoming modals)
  const otherPersonName = (() => {
    if (!activeConv) return "User";
    const other = getOtherParticipant(activeConv, myId);
    return other ? `${other.first_name} ${other.last_name}` : "User";
  })();

  // Incoming caller name
  const callerName =
    callState.phase === "incoming"
      ? participantMeta[String(callState.callerId)]?.name ?? "Someone"
      : "";

  const callerAvatar =
    callState.phase === "incoming"
      ? participantMeta[String(callState.callerId)]?.avatarUrl
      : undefined;

  return (
    <AppShell activeItem="Messages">
      {showNew && (
        <NewConversationModal
          onClose={() => setShowNew(false)}
          onStart={(userId) => createMutation.mutate(userId)}
        />
      )}

      {/* Outgoing call */}
      {callState.phase === "calling" && (
        <OutgoingCallModal calleeName={otherPersonName} onCancel={cancelCall} />
      )}

      {/* Incoming call */}
      {callState.phase === "incoming" && (
        <IncomingCallModal
          callerName={callerName}
          callerAvatar={callerAvatar}
          onAccept={() => handleAccept(callState.conversationId)}
          onReject={() => handleReject(callState.conversationId)}
        />
      )}

      {/* Active call overlay */}
      {callState.phase === "connected" && (
        <CallOverlay
          token={callState.token}
          wsUrl={callState.wsUrl}
          roomName={callState.roomName}
          participantMeta={participantMeta}
          onEnd={handleEnd}
        />
      )}

      <div className="flex h-[calc(100dvh-4rem-2rem)] overflow-hidden rounded-xl border border-[#dde4e8] bg-white shadow-sm">
        {/* Sidebar */}
        <div className="flex w-72 shrink-0 flex-col border-r border-[#dde4e8]">
          <div className="flex items-center justify-between px-4 py-4">
            <h2 className="text-lg font-bold text-[#101820]">Messages</h2>
            <button
              onClick={() => setShowNew(true)}
              className="flex size-8 items-center justify-center rounded-lg text-[#5a6b6d] transition hover:bg-[#f0f4f8] hover:text-[#073f43]"
              title="New message"
            >
              <Edit className="size-4" />
            </button>
          </div>

          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 rounded-lg bg-[#f5f7f9] px-3 py-2">
              <Search className="size-3.5 text-[#8a9a9c]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="flex-1 bg-transparent text-xs text-[#101820] outline-none placeholder:text-[#8a9a9c]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-2">
            {isLoading || isLoadingIdentity ? (
              <div className="space-y-1 px-2 pt-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-3">
                    <div className="size-11 animate-pulse rounded-full bg-[#e4eaf0]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-3/4 animate-pulse rounded bg-[#e4eaf0]" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-[#e4eaf0]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[#8a9a9c]">
                {isLoadingIdentity
                  ? "Loading your conversations..."
                  : conversations.length === 0
                  ? "No conversations yet."
                  : "No results."}
              </p>
            ) : (
              filtered.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  myId={myId}
                  isActive={conv.id === activeConvId}
                  onClick={() => setActiveConvId(conv.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Main panel */}
        {activeConv ? (
          <ChatPanel
            conversation={activeConv}
            myId={myId}
            onCall={() => initiateCall(activeConv.id)}
          />
        ) : (
          <EmptyState onNew={() => setShowNew(true)} />
        )}
      </div>
    </AppShell>
  );
}
