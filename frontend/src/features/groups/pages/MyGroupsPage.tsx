import {
  Check,
  Hash,
  Info,
  MessageSquare,
  MoreVertical,
  Plus,
  Search,
  Send,
  Settings,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/features/auth/store/authStore";
import { feedApi } from "@/features/feed/api/feedApi";
import type { FeedPost } from "@/features/feed/types/feed.types";
import { getSocket } from "@/lib/socket";
import { groupsApi } from "../api/groupsApi";
import type {
  ChannelJoinedPayload,
  ChannelMessage,
  ChannelMessagePayload,
  Group,
  GroupChannel,
  GroupMember,
  GroupMembership,
} from "../types/groups.types";

type GroupTab = "feed" | "channels" | "members" | "about";

type PresenceSnapshotPayload = {
  user_ids: number[];
};

type PresenceUserPayload = {
  user_id: number;
};

type ChannelTypingPayload = {
  user_id: number;
  channel_id: number;
  conversation_id: number;
};

const tabs: Array<{ label: string; value: GroupTab }> = [
  { label: "Feed", value: "feed" },
  { label: "Channels", value: "channels" },
  { label: "Members", value: "members" },
  { label: "About", value: "about" },
];

const EMPTY_MEMBERSHIPS: GroupMembership[] = [];
const EMPTY_CHANNELS: GroupChannel[] = [];
const EMPTY_MEMBERS: GroupMember[] = [];

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error && "message" in error) {
    return String(error.message);
  }

  return fallback;
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatMessageTime(date: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function useOnlineUserIds() {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const socket = getSocket();

    function handlePresenceSnapshot(payload: PresenceSnapshotPayload) {
      setOnlineUserIds(new Set(payload.user_ids));
    }

    function handleUserOnline(payload: PresenceUserPayload) {
      setOnlineUserIds((currentUserIds) => {
        const nextUserIds = new Set(currentUserIds);
        nextUserIds.add(payload.user_id);
        return nextUserIds;
      });
    }

    function handleUserOffline(payload: PresenceUserPayload) {
      setOnlineUserIds((currentUserIds) => {
        const nextUserIds = new Set(currentUserIds);
        nextUserIds.delete(payload.user_id);
        return nextUserIds;
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

function getGroupDescription(group: Group) {
  return (
    group.description ??
    "A focused academic space for sharing resources, discussing projects, and coordinating study sessions."
  );
}

function EmptyGroupsState() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  const createGroupMutation = useMutation({
    mutationFn: groupsApi.createGroup,
    onSuccess: () => {
      setName("");
      setDescription("");
      void queryClient.invalidateQueries({ queryKey: ["groups", "my"] });
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    createGroupMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      visibility,
    });
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-3xl items-center">
      <Card className="w-full border-[#b8c4c7] bg-white">
        <CardContent className="grid gap-8 p-8 md:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="flex size-14 items-center justify-center rounded-md bg-[#dbe8fb]">
              <UsersRound className="size-7 text-[#073f43]" />
            </div>
            <h1 className="mt-5 text-3xl font-bold text-[#061f22]">
              Start your first academic group
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#53676b]">
              You are not part of any group yet. Create a space for your class,
              research team, study circle, or project collaborators.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="group-name">
                Group name
              </label>
              <Input
                id="group-name"
                placeholder="Computer Science Students"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="group-description">
                Description
              </label>
              <textarea
                id="group-description"
                className="min-h-28 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                placeholder="Share what this group is for..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(["public", "private"] as const).map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={visibility === option ? "secondary" : "outline"}
                  className={visibility === option ? "bg-[#edf3fb]" : ""}
                  onClick={() => setVisibility(option)}
                >
                  {option === "public" ? "Public" : "Private"}
                </Button>
              ))}
            </div>

            {createGroupMutation.error ? (
              <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {getErrorMessage(createGroupMutation.error, "Could not create group.")}
              </p>
            ) : null}

            <Button
              className="h-10 w-full bg-[#073f43] text-white hover:bg-[#062f33]"
              disabled={createGroupMutation.isPending}
            >
              <Plus className="size-4" />
              {createGroupMutation.isPending ? "Creating..." : "Create group"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function GroupList({
  memberships,
  selectedGroupId,
  onSelectGroup,
}: {
  memberships: GroupMembership[];
  selectedGroupId?: number;
  onSelectGroup: (groupId: number) => void;
}) {
  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardHeader className="p-4">
        <h2 className="text-lg font-semibold">My Groups</h2>
        <span className="rounded-full bg-[#edf3fb] px-2.5 py-1 text-xs font-bold">
          {memberships.length}
        </span>
      </CardHeader>
      <CardContent className="space-y-2 px-4 pb-4">
        {memberships.map((membership) => {
          const group = membership.group;
          const isSelected = group.id === selectedGroupId;

          return (
            <button
              key={group.id}
              className={`flex w-full items-center gap-3 rounded-md p-3 text-left transition ${
                isSelected ? "bg-[#d0dee9]" : "hover:bg-[#edf3fb]"
              }`}
              type="button"
              onClick={() => onSelectGroup(group.id)}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#073f43] text-xs font-bold text-white">
                {getInitials(group.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{group.name}</p>
                <p className="text-xs text-[#53676b]">
                  {membership.role ?? "member"} - {membership.status ?? "active"}
                </p>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function GroupHero({
  group,
  activeTab,
  onTabChange,
}: {
  group: Group;
  activeTab: GroupTab;
  onTabChange: (tab: GroupTab) => void;
}) {
  return (
    <Card className="overflow-hidden border-[#b8c4c7] bg-white">
      <div className="relative h-44 bg-[#073f43]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,50,52,0.96),rgba(16,108,108,0.78)),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(0,0,0,0.2))]" />
        <div className="absolute inset-y-0 left-10 w-28 border-x border-white/10" />
        <div className="absolute right-12 top-0 h-full w-56 border-x border-white/15" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white/8" />
        <div className="absolute left-8 top-1/2 flex -translate-y-1/2 items-center gap-5">
          <div className="flex size-16 items-center justify-center rounded-md border-2 border-white bg-[#0b5557] text-xl font-bold text-white">
            {getInitials(group.name)}
          </div>
          <div className="text-white">
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <p className="mt-1 text-sm text-white/80">
              {group.visibility ?? "public"} academic community
            </p>
          </div>
        </div>
      </div>

      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <p className="max-w-2xl text-sm leading-6 text-[#1f2937]">
            {getGroupDescription(group)}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" className="bg-[#edf3fb]">
              <Check className="size-4" />
              Joined
            </Button>
            <Button variant="outline" size="icon-sm" aria-label="Group settings">
              <Settings className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mt-5 flex gap-6 border-b border-[#d6dde3]">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              className={`border-b-2 px-1 pb-3 text-sm font-semibold ${
                activeTab === tab.value
                  ? "border-[#073f43] text-[#073f43]"
                  : "border-transparent text-[#53676b]"
              }`}
              type="button"
              onClick={() => onTabChange(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FeedTab({ groupId }: { groupId: number }) {
  const feedQuery = useQuery({
    queryKey: ["groups", groupId, "feed"],
    queryFn: () => feedApi.getFeed({ groupId, limit: 10 }),
    retry: false,
  });

  if (feedQuery.isLoading) {
    return (
      <Card className="border-[#b8c4c7] bg-white">
        <CardContent className="p-5 text-sm text-[#53676b]">
          Loading group feed...
        </CardContent>
      </Card>
    );
  }

  const posts = feedQuery.data?.data ?? [];

  if (!posts.length) {
    return (
      <Card className="border-[#b8c4c7] bg-white">
        <CardContent className="p-5">
          <h2 className="text-base font-semibold">No group posts yet</h2>
          <p className="mt-2 text-sm text-[#53676b]">
            Group posts will appear here when members publish to this group.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post: FeedPost) => (
        <Card key={post.id} className="border-[#b8c4c7] bg-white">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex size-10 items-center justify-center rounded-md bg-[#073f43] text-xs font-bold text-white">
                  {post.user.first_name[0]}
                  {post.user.last_name[0]}
                </div>
                <div>
                  <p className="font-semibold">
                    {post.user.first_name} {post.user.last_name}
                  </p>
                  <p className="text-xs font-medium uppercase text-[#53676b]">
                    Group post
                  </p>
                </div>
              </div>
              <MoreVertical className="size-4 text-[#53676b]" />
            </div>
            <p className="mt-4 text-sm leading-7">{post.content}</p>
            <div className="mt-4 flex gap-5 border-t border-[#d6dde3] pt-3 text-sm text-[#53676b]">
              <span>{post.stats.reactions} reactions</span>
              <span>{post.stats.comments} comments</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChannelsTab({ group }: { group: Group }) {
  const groupId = group.id;
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const typingTimeoutRef = useRef<number | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [typingUserIds, setTypingUserIds] = useState<Set<number>>(new Set());
  const [connectionState, setConnectionState] = useState<
    "idle" | "connecting" | "connected" | "error"
  >("idle");
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
  const selectedChannel = useMemo<GroupChannel | undefined>(() => {
    return channels.find((channel) => channel.id === selectedChannelId) ?? channels[0];
  }, [channels, selectedChannelId]);
  const memberNameById = useMemo(() => {
    return new Map(
      members.map((member) => [
        member.user_id,
        `${member.user.first_name} ${member.user.last_name}`.trim(),
      ])
    );
  }, [members]);
  const typingNames = useMemo(() => {
    return Array.from(typingUserIds)
      .filter((userId) => userId !== currentUserId)
      .map((userId) => memberNameById.get(userId) ?? "Someone");
  }, [currentUserId, memberNameById, typingUserIds]);
  const currentUserLabel = currentUser?.email ?? "Signed-in user";
  const currentUserInitials = getInitials(currentUserLabel) || "U";
  const canManageChannels = group.owner_id === currentUserId;

  const createChannelMutation = useMutation({
    mutationFn: () =>
      groupsApi.createGroupChannel(groupId, {
        name: channelName.trim(),
        type: "text",
        description: channelDescription.trim() || undefined,
      }),
    onSuccess: (channel) => {
      setChannelName("");
      setChannelDescription("");
      setSelectedChannelId(channel.id);
      void queryClient.invalidateQueries({
        queryKey: ["groups", groupId, "channels"],
      });
    },
  });

  useEffect(() => {
    if (!selectedChannel) {
      const resetTimer = window.setTimeout(() => {
        setMessages([]);
        setConnectionState("idle");
      }, 0);

      return () => window.clearTimeout(resetTimer);
    }

    let isActive = true;
    const channel = selectedChannel;
    const socket = getSocket();

    queueMicrotask(() => {
      if (!isActive) {
        return;
      }

      setMessages([]);
      setMessageDraft("");
      setSocketError(null);
      setConnectionState("connecting");
      setTypingUserIds(new Set());
    });

    function handleChannelJoined(payload: ChannelJoinedPayload) {
      if (!isActive || payload.channel_id !== channel.id) {
        return;
      }

      setMessages(payload.messages);
      setConnectionState("connected");
    }

    function handleNewChannelMessage(payload: ChannelMessagePayload) {
      if (!isActive || payload.channel_id !== channel.id) {
        return;
      }

      setTypingUserIds((currentUserIds) => {
        if (!currentUserIds.has(payload.message.sender_id)) {
          return currentUserIds;
        }

        const nextUserIds = new Set(currentUserIds);
        nextUserIds.delete(payload.message.sender_id);
        return nextUserIds;
      });
      setMessages((currentMessages) => {
        if (currentMessages.some((message) => message.id === payload.message.id)) {
          return currentMessages;
        }

        return [...currentMessages, payload.message];
      });
      setConnectionState("connected");
    }

    function handleChannelTyping(payload: ChannelTypingPayload) {
      if (!isActive || payload.channel_id !== channel.id || payload.user_id === currentUserId) {
        return;
      }

      setTypingUserIds((currentUserIds) => {
        const nextUserIds = new Set(currentUserIds);
        nextUserIds.add(payload.user_id);
        return nextUserIds;
      });
    }

    function handleChannelStopTyping(payload: ChannelTypingPayload) {
      if (!isActive || payload.channel_id !== channel.id) {
        return;
      }

      setTypingUserIds((currentUserIds) => {
        if (!currentUserIds.has(payload.user_id)) {
          return currentUserIds;
        }

        const nextUserIds = new Set(currentUserIds);
        nextUserIds.delete(payload.user_id);
        return nextUserIds;
      });
    }

    function handleException(message: string) {
      if (!isActive) {
        return;
      }

      setSocketError(String(message));
      setConnectionState("error");
    }

    function handleConnectError(error: Error) {
      if (!isActive) {
        return;
      }

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

      if (socket.connected) {
        socket.emit("leave_channel", { channel_id: channel.id });
      }
    };
  }, [currentUserId, selectedChannel]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  function emitStopTyping(channelId: number) {
    const socket = getSocket();
    socket.emit("channel_stop_typing", { channel_id: channelId });
  }

  function handleMessageDraftChange(value: string) {
    setMessageDraft(value);

    if (!selectedChannel) {
      return;
    }

    const socket = getSocket();
    socket.emit("channel_typing", { channel_id: selectedChannel.id });

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      emitStopTyping(selectedChannel.id);
      typingTimeoutRef.current = null;
    }, 1200);
  }

  function handleSendChannelMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedChannel || !messageDraft.trim()) {
      return;
    }

    const socket = getSocket();
    socket.emit("send_channel_message", {
      channel_id: selectedChannel.id,
      content: messageDraft.trim(),
      message_type: "text",
    });
    emitStopTyping(selectedChannel.id);
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setMessageDraft("");
  }

  function handleCreateChannel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!channelName.trim()) {
      return;
    }

    createChannelMutation.mutate();
  }

  if (channelsQuery.isLoading) {
    return (
      <Card className="border-[#b8c4c7] bg-white">
        <CardContent className="p-5 text-sm text-[#53676b]">
          Loading channels...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-[#b8c4c7] bg-white">
      <div className="grid min-h-[30rem] md:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="border-r border-[#d6dde3] bg-[#e9eff8]">
          <div className="border-b border-[#d6dde3] px-4 py-3">
            <p className="text-xs font-bold uppercase text-[#53676b]">
              Academic Channels
            </p>
          </div>
          <div className="space-y-1 p-3">
            {channels.length ? (
              channels.map((channel) => {
                const isActive = channel.id === selectedChannel?.id;

                return (
                  <button
                    key={channel.id}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold ${
                      isActive ? "bg-[#d0dee9] text-[#073f43]" : "hover:bg-white/70"
                    }`}
                    type="button"
                    onClick={() => setSelectedChannelId(channel.id)}
                  >
                    <Hash className="size-4" />
                    {channel.name}
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-2 text-sm text-[#53676b]">
                No channels have been created yet.
              </p>
            )}
          </div>
          {canManageChannels ? (
            <form
              className="mx-3 mt-3 space-y-2 rounded-md border border-[#c8d3dc] bg-white p-3"
              onSubmit={handleCreateChannel}
            >
              <p className="text-xs font-bold uppercase text-[#53676b]">
                New channel
              </p>
              <Input
                aria-label="Channel name"
                className="h-8"
                placeholder="announcements"
                value={channelName}
                onChange={(event) => setChannelName(event.target.value)}
              />
              <textarea
                aria-label="Channel description"
                className="min-h-16 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                placeholder="What members should discuss here"
                value={channelDescription}
                onChange={(event) => setChannelDescription(event.target.value)}
              />
              {createChannelMutation.error ? (
                <p className="rounded-md border border-destructive/20 bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
                  {getErrorMessage(
                    createChannelMutation.error,
                    "Could not create channel."
                  )}
                </p>
              ) : null}
              <Button
                className="h-8 w-full bg-[#073f43] text-white hover:bg-[#062f33]"
                disabled={!channelName.trim() || createChannelMutation.isPending}
                size="sm"
              >
                <Plus className="size-3.5" />
                {createChannelMutation.isPending ? "Creating..." : "Create channel"}
              </Button>
            </form>
          ) : null}
          <div className="mt-auto border-t border-[#d6dde3] px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-md bg-[#d0dee9] text-xs font-bold">
                {currentUserInitials}
              </div>
              <div>
                <p className="max-w-[11rem] truncate text-sm font-bold">
                  {currentUserLabel}
                </p>
                <p className="text-xs font-bold uppercase text-emerald-700">Online</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-h-[30rem] flex-col">
          <div className="flex items-center justify-between border-b border-[#d6dde3] px-4 py-3">
            <div>
              <h2 className="flex items-center gap-2 text-base font-bold">
                <Hash className="size-4" />
                {selectedChannel?.name ?? "channels"}
              </h2>
              <p className="mt-1 text-xs text-[#53676b]">
                {selectedChannel?.description ?? "Discussion space for this group."}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon-sm" aria-label="Search channel">
                <Search className="size-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" aria-label="Channel members">
                <UsersRound className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {socketError ? (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {socketError}
                </div>
              ) : null}

              {connectionState === "connecting" ? (
                <p className="text-sm text-[#53676b]">Joining channel...</p>
              ) : null}

              {messages.length ? (
                messages.map((message) => {
                  const isOwnMessage = message.sender_id === currentUserId;

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isOwnMessage ? (
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#073f43] text-xs font-bold text-white">
                          {message.sender.first_name[0]}
                          {message.sender.last_name[0]}
                        </div>
                      ) : null}
                      <div
                        className={`max-w-[75%] rounded-md border px-3 py-2 ${
                          isOwnMessage
                            ? "border-[#073f43] bg-[#073f43] text-white"
                            : "border-[#d6dde3] bg-[#f8fafc]"
                        }`}
                      >
                        <div className="flex items-baseline gap-2">
                          <p className="text-sm font-bold">
                            {isOwnMessage
                              ? "You"
                              : `${message.sender.first_name} ${message.sender.last_name}`}
                          </p>
                          <span
                            className={`text-xs ${
                              isOwnMessage ? "text-white/70" : "text-[#53676b]"
                            }`}
                          >
                            {formatMessageTime(message.created_at)}
                          </span>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : connectionState !== "connecting" ? (
                <div className="flex h-full min-h-64 items-center justify-center text-center">
                  <div className="max-w-sm">
                    <MessageSquare className="mx-auto size-10 text-[#53676b]" />
                    <h3 className="mt-4 text-lg font-semibold">No messages yet</h3>
                    <p className="mt-2 text-sm leading-6 text-[#53676b]">
                      Start the first discussion in this channel.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {typingNames.length ? (
            <div className="border-t border-[#d6dde3] px-4 py-2 text-xs font-medium text-[#53676b]">
              {typingNames.length === 1
                ? `${typingNames[0]} is typing...`
                : `${typingNames.slice(0, 2).join(", ")} are typing...`}
            </div>
          ) : null}

          <form className="border-t border-[#d6dde3] p-3" onSubmit={handleSendChannelMessage}>
            <div className="flex items-center gap-2 rounded-md border border-[#b8c4c7] bg-white px-3 py-2">
              <Plus className="size-4 text-[#53676b]" />
              <input
                className="flex-1 bg-transparent text-sm outline-none"
                placeholder={`Message ${selectedChannel?.name ?? "channel"}`}
                value={messageDraft}
                onChange={(event) => handleMessageDraftChange(event.target.value)}
                disabled={!selectedChannel}
              />
              <Button
                size="icon-sm"
                className="bg-[#073f43] text-white"
                disabled={!selectedChannel || !messageDraft.trim()}
              >
                <Send className="size-4" />
              </Button>
            </div>
          </form>
        </section>
      </div>
    </Card>
  );
}

function MembersTab({ groupId }: { groupId: number }) {
  const onlineUserIds = useOnlineUserIds();
  const membersQuery = useQuery({
    queryKey: ["groups", groupId, "members"],
    queryFn: () => groupsApi.getGroupMembers(groupId),
    retry: false,
  });
  const members = membersQuery.data ?? EMPTY_MEMBERS;

  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardHeader className="p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <UsersRound className="size-5" />
          Members
        </h2>
        <span className="rounded-full bg-[#edf3fb] px-2.5 py-1 text-xs font-bold">
          {members.length}
        </span>
      </CardHeader>
      <CardContent className="grid gap-3 px-5 pb-5 sm:grid-cols-2">
        {membersQuery.isLoading ? (
          <p className="text-sm text-[#53676b]">Loading members...</p>
        ) : members.length ? (
          members.map((member) => {
            const isOnline = onlineUserIds.has(member.user_id);

            return (
              <div
                key={member.user_id}
                className="flex items-center gap-3 rounded-md border border-[#d6dde3] p-3"
              >
                <div className="relative">
                  <div className="flex size-10 items-center justify-center rounded-full bg-[#0b5557] text-xs font-bold text-white">
                    {member.user.first_name[0]}
                    {member.user.last_name[0]}
                  </div>
                  <span
                    aria-label={isOnline ? "Online" : "Offline"}
                    className={`absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-white ${
                      isOnline ? "bg-emerald-500" : "bg-[#9ca3af]"
                    }`}
                    title={isOnline ? "Online" : "Offline"}
                  />
                </div>
                <div>
                  <p className="text-sm font-bold">
                    {member.user.first_name} {member.user.last_name}
                  </p>
                  <p className="text-xs text-[#53676b]">
                    {member.role ?? "member"} - {isOnline ? "online" : "offline"}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-[#53676b]">No members found.</p>
        )}
      </CardContent>
    </Card>
  );
}

function AboutTab({ group }: { group: Group }) {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_18rem]">
      <Card className="border-[#b8c4c7] bg-white">
        <CardHeader className="p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Info className="size-5" />
            About {group.name}
          </h2>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5">
          <p className="text-sm leading-7 text-[#1f2937]">
            {getGroupDescription(group)}
          </p>
          <div className="rounded-md bg-[#edf3fb] p-4">
            <p className="text-xs font-bold uppercase text-[#53676b]">
              Community focus
            </p>
            <p className="mt-2 text-sm">
              Resource sharing, course collaboration, academic discussion, and
              project coordination.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#b8c4c7] bg-white">
        <CardContent className="space-y-4 p-5">
          <div>
            <p className="text-xs font-bold uppercase text-[#53676b]">Created</p>
            <p className="mt-1 text-sm font-semibold">{formatDate(group.created_at)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-[#53676b]">Visibility</p>
            <p className="mt-1 text-sm font-semibold">{group.visibility ?? "public"}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-[#53676b]">Owner ID</p>
            <p className="mt-1 text-sm font-semibold">{group.owner_id}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SelectedGroupView({
  group,
  activeTab,
  onTabChange,
}: {
  group: Group;
  activeTab: GroupTab;
  onTabChange: (tab: GroupTab) => void;
}) {
  return (
    <div className="space-y-4">
      <GroupHero group={group} activeTab={activeTab} onTabChange={onTabChange} />

      {activeTab === "feed" ? <FeedTab groupId={group.id} /> : null}
      {activeTab === "channels" ? <ChannelsTab group={group} /> : null}
      {activeTab === "members" ? <MembersTab groupId={group.id} /> : null}
      {activeTab === "about" ? <AboutTab group={group} /> : null}
    </div>
  );
}

function CreateGroupCompactCard() {
  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#ffc85c] text-[#6b4a05]">
            <Plus className="size-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Create a new group</h2>
            <p className="mt-1 text-xs leading-5 text-[#53676b]">
              Start a new class, research, or project community from the empty
              state when you are not part of any groups.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RightRail({
  memberships,
  selectedGroupId,
  onSelectGroup,
}: {
  memberships: GroupMembership[];
  selectedGroupId?: number;
  onSelectGroup: (groupId: number) => void;
}) {
  return (
    <div className="space-y-5">
      <GroupList
        memberships={memberships}
        selectedGroupId={selectedGroupId}
        onSelectGroup={onSelectGroup}
      />
      <CreateGroupCompactCard />
    </div>
  );
}

export function MyGroupsPage() {
  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>();
  const [activeTab, setActiveTab] = useState<GroupTab>("channels");
  const myGroupsQuery = useQuery({
    queryKey: ["groups", "my"],
    queryFn: groupsApi.getMyGroups,
    retry: false,
  });
  const memberships = myGroupsQuery.data ?? EMPTY_MEMBERSHIPS;
  const selectedMembership = useMemo(() => {
    return (
      memberships.find((membership) => membership.group.id === selectedGroupId) ??
      memberships[0]
    );
  }, [memberships, selectedGroupId]);

  if (myGroupsQuery.isLoading) {
    return (
      <AppShell activeItem="My Groups">
        <Card className="border-[#b8c4c7] bg-white">
          <CardContent className="p-5 text-sm text-[#53676b]">
            Loading your groups...
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  if (!memberships.length) {
    return (
      <AppShell activeItem="My Groups">
        <EmptyGroupsState />
      </AppShell>
    );
  }

  return (
    <AppShell
      activeItem="My Groups"
      rightRail={
        <RightRail
          memberships={memberships}
          selectedGroupId={selectedMembership?.group.id}
          onSelectGroup={(groupId) => {
            setSelectedGroupId(groupId);
            setActiveTab("channels");
          }}
        />
      }
    >
      <div className="mx-auto max-w-[58rem]">
        {selectedMembership ? (
          <SelectedGroupView
            group={selectedMembership.group}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        ) : null}
      </div>
    </AppShell>
  );
}
