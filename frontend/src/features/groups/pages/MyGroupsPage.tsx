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
  X,                // ✅ FIX: was missing — caused "X is not defined" ReferenceError
  Globe,
  Lock,
  Zap,
  ChevronRight,
  Users,
  Image,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/features/auth/store/authStore";
import { feedApi } from "@/features/feed/api/feedApi";
import type { FeedPost } from "@/features/feed/types/feed.types";
import { cloudinaryApi } from "@/lib/cloudinary";
import { getSocket } from "@/lib/socket";
import { groupsApi } from "../../groups/api/groupsApi";
import { Avatar } from "../components/Avatar";
import type {
  ChannelJoinedPayload,
  ChannelMessage,
  ChannelMessagePayload,
  Group,
  GroupChannel,
  GroupMember,
  GroupMembership,
} from "../../groups/types/groups.types";

// ─── Types ────────────────────────────────────────────────────────────────────

type GroupTab = "feed" | "channels" | "members" | "about";

type PresenceSnapshotPayload = { user_ids: number[] };
type PresenceUserPayload = { user_id: number };
type ChannelTypingPayload = {
  user_id: number;
  channel_id: number;
  conversation_id: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const tabs: Array<{ label: string; value: GroupTab; icon: React.ElementType }> = [
  { label: "Feed",     value: "feed",     icon: Zap },
  { label: "Channels", value: "channels", icon: Hash },
  { label: "Members",  value: "members",  icon: Users },
  { label: "About",    value: "about",    icon: Info },
];

const EMPTY_MEMBERSHIPS: GroupMembership[] = [];
const EMPTY_CHANNELS: GroupChannel[] = [];
const EMPTY_MEMBERS: GroupMember[] = [];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message: unknown }).message);
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

function getGroupDescription(group: Group) {
  return (
    group.description ??
    "A focused academic space for sharing resources, discussing projects, and coordinating study sessions."
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useOnlineUserIds() {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const socket = getSocket();

    function handlePresenceSnapshot(payload: PresenceSnapshotPayload) {
      setOnlineUserIds(new Set(payload.user_ids));
    }
    function handleUserOnline(payload: PresenceUserPayload) {
      setOnlineUserIds((s) => { const n = new Set(s); n.add(payload.user_id); return n; });
    }
    function handleUserOffline(payload: PresenceUserPayload) {
      setOnlineUserIds((s) => { const n = new Set(s); n.delete(payload.user_id); return n; });
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



// ─── Empty State ──────────────────────────────────────────────────────────────

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
    if (!name.trim()) return;
    createGroupMutation.mutate({ name: name.trim(), description: description.trim() || undefined, visibility });
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-3xl items-center py-8">
      <div className="w-full overflow-hidden rounded-2xl border border-[#d6dde3] bg-white shadow-lg">
        {/* Banner */}
        <div className="relative overflow-hidden bg-[#073f43] px-8 py-10 text-white">
          <div className="absolute -right-12 -top-12 size-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 right-16 size-32 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
              <UsersRound className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Your Groups</h1>
              <p className="mt-1 text-sm text-white/70">
                You haven't joined or created any groups yet.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-2">
          {/* Left: explanation */}
          <div className="border-r border-[#edf3fb] p-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#073f43]">
              Why create a group?
            </p>
            <ul className="mt-5 space-y-4">
              {[
                { icon: Users,  text: "Collaborate with classmates and lab partners" },
                { icon: Hash,   text: "Focused channels for each topic or project" },
                { icon: Zap,    text: "Real-time chat and group-level post feed" },
                { icon: Globe,  text: "Public or private — you control access" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#edf3fb]">
                    <Icon className="size-3.5 text-[#073f43]" />
                  </div>
                  <span className="text-sm leading-6 text-[#3d5156]">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: form */}
          <form className="space-y-4 p-8" onSubmit={handleSubmit}>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-[#073f43]">
                Create your first group
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#101820]" htmlFor="group-name">
                Group name
              </label>
              <Input
                id="group-name"
                placeholder="Computer Science Students"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-[#c8d1d7] focus-visible:border-[#073f43]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#101820]" htmlFor="group-description">
                Description <span className="font-normal text-[#8a9a9c]">(optional)</span>
              </label>
              <textarea
                id="group-description"
                className="min-h-24 w-full resize-none rounded-lg border border-[#c8d1d7] bg-white px-3 py-2 text-sm outline-none transition focus-visible:border-[#073f43] focus-visible:ring-2 focus-visible:ring-[#073f43]/20"
                placeholder="What is this group about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(["public", "private"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setVisibility(option)}
                  className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition ${
                    visibility === option
                      ? "border-[#073f43] bg-[#073f43] text-white"
                      : "border-[#c8d1d7] bg-white text-[#3d5156] hover:border-[#073f43]/40"
                  }`}
                >
                  {option === "public" ? <Globe className="size-3.5" /> : <Lock className="size-3.5" />}
                  {option === "public" ? "Public" : "Private"}
                </button>
              ))}
            </div>

            {createGroupMutation.error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {getErrorMessage(createGroupMutation.error, "Could not create group.")}
              </p>
            ) : null}

            <Button
              className="h-11 w-full rounded-xl bg-[#073f43] text-sm font-semibold text-white hover:bg-[#052c2f]"
              disabled={!name.trim() || createGroupMutation.isPending}
            >
              <Plus className="size-4" />
              {createGroupMutation.isPending ? "Creating..." : "Create group"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Group List (right rail) ──────────────────────────────────────────────────

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
    <div className="overflow-hidden rounded-2xl border border-[#d6dde3] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#edf3fb] px-4 py-3">
        <h2 className="text-sm font-bold text-[#101820]">My Groups</h2>
        <span className="rounded-full bg-[#073f43] px-2.5 py-0.5 text-xs font-bold text-white">
          {memberships.length}
        </span>
      </div>
      <div className="divide-y divide-[#f3f6fb]">
        {memberships.map((membership) => {
          const group = membership.group;
          const isSelected = group.id === selectedGroupId;

          return (
            <button
              key={group.id}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                isSelected ? "bg-[#edf8f4]" : "hover:bg-[#f8fafc]"
              }`}
              type="button"
              onClick={() => onSelectGroup(group.id)}
            >
              <Avatar initials={getInitials(group.name)} size="sm" />
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-semibold ${isSelected ? "text-[#073f43]" : "text-[#101820]"}`}>
                  {group.name}
                </p>
                <p className="text-xs text-[#7a8e91]">{membership.role ?? "member"}</p>
              </div>
              {isSelected && (
                <div className="size-1.5 shrink-0 rounded-full bg-[#073f43]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Group Hero ───────────────────────────────────────────────────────────────

function GroupHero({
  group,
  activeTab,
  onTabChange,
  onOpenSettings,
}: {
  group: Group;
  activeTab: GroupTab;
  onTabChange: (tab: GroupTab) => void;
  onOpenSettings: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#d6dde3] bg-white shadow-sm">
      {/* Banner */}
      <div className="relative overflow-hidden bg-[#073f43] px-6 py-6 text-white">
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 right-32 size-24 rounded-full bg-white/5" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-lg font-bold">
              {getInitials(group.name)}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight">{group.name}</h1>
              <p className="mt-1 line-clamp-1 text-sm text-white/65">
                {getGroupDescription(group)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
              <Check className="size-3.5" />
              Joined
            </div>
            <button
              type="button"
              aria-label="Group settings"
              onClick={onOpenSettings}
              className="flex size-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 transition hover:bg-white/20"
            >
              <Settings className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex overflow-x-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTabChange(tab.value)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "border-[#073f43] text-[#073f43]"
                  : "border-transparent text-[#7a8e91] hover:text-[#3d5156]"
              }`}
            >
              <Icon className="size-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Group Settings Modal ─────────────────────────────────────────────────────

function GroupSettingsModal({
  group,
  onClose,
}: {
  group: Group;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description ?? "");
  const [visibility, setVisibility] = useState<"public" | "private">(
    group.visibility === "private" ? "private" : "public"
  );
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");

  const updateGroupMutation = useMutation({
    mutationFn: () =>
      groupsApi.updateGroup(group.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        visibility,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["groups", "my"] });
    },
  });

  const createChannelMutation = useMutation({
    mutationFn: () =>
      groupsApi.createGroupChannel(group.id, {
        name: channelName.trim(),
        type: "text",
        description: channelDescription.trim() || undefined,
      }),
    onSuccess: () => {
      setChannelName("");
      setChannelDescription("");
      void queryClient.invalidateQueries({ queryKey: ["groups", group.id, "channels"] });
    },
  });

  function handleUpdateGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    updateGroupMutation.mutate();
  }

  function handleCreateChannel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!channelName.trim()) return;
    createChannelMutation.mutate();
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="max-h-[calc(100dvh-3rem)] w-full max-w-2xl overflow-hidden rounded-2xl border border-[#c8d1d7] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#edf3fb] bg-[#073f43] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl border border-white/20 bg-white/10">
              <Settings className="size-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Group settings</h2>
              <p className="text-xs text-white/60">{group.name}</p>
            </div>
          </div>
          {/* ✅ X is now correctly imported above */}
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 transition hover:bg-white/20"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="grid max-h-[calc(100dvh-9rem)] overflow-y-auto md:grid-cols-2">
          {/* Group info form */}
          <form
            className="space-y-4 border-b border-[#edf3fb] p-6 md:border-b-0 md:border-r"
            onSubmit={handleUpdateGroup}
          >
            <div>
              <h3 className="font-semibold text-[#101820]">Group info</h3>
              <p className="mt-1 text-xs leading-5 text-[#7a8e91]">
                Update the name, description, and visibility.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#101820]" htmlFor="settings-group-name">
                Name
              </label>
              <Input
                id="settings-group-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-[#c8d1d7] focus-visible:border-[#073f43]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#101820]" htmlFor="settings-group-description">
                Description
              </label>
              <textarea
                id="settings-group-description"
                className="min-h-24 w-full resize-none rounded-lg border border-[#c8d1d7] bg-white px-3 py-2 text-sm outline-none transition focus-visible:border-[#073f43] focus-visible:ring-2 focus-visible:ring-[#073f43]/20"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(["public", "private"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setVisibility(option)}
                  className={`flex items-center justify-center gap-2 rounded-lg border py-2 text-sm font-semibold transition ${
                    visibility === option
                      ? "border-[#073f43] bg-[#073f43] text-white"
                      : "border-[#c8d1d7] bg-white text-[#3d5156] hover:border-[#073f43]/40"
                  }`}
                >
                  {option === "public" ? <Globe className="size-3.5" /> : <Lock className="size-3.5" />}
                  {option === "public" ? "Public" : "Private"}
                </button>
              ))}
            </div>

            {updateGroupMutation.error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {getErrorMessage(updateGroupMutation.error, "Could not update group.")}
              </p>
            ) : updateGroupMutation.isSuccess ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                Changes saved successfully.
              </p>
            ) : null}

            <Button
              className="w-full rounded-xl bg-[#073f43] font-semibold text-white hover:bg-[#052c2f]"
              disabled={!name.trim() || updateGroupMutation.isPending}
            >
              {updateGroupMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </form>

          {/* Create channel form */}
          <form className="space-y-4 p-6" onSubmit={handleCreateChannel}>
            <div>
              <h3 className="font-semibold text-[#101820]">Create channel</h3>
              <p className="mt-1 text-xs leading-5 text-[#7a8e91]">
                Add a focused space for announcements, labs, or project work.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#101820]" htmlFor="settings-channel-name">
                Channel name
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#7a8e91]" />
                <Input
                  id="settings-channel-name"
                  placeholder="announcements"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  className="border-[#c8d1d7] pl-8 focus-visible:border-[#073f43]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#101820]" htmlFor="settings-channel-description">
                Description <span className="font-normal text-[#8a9a9c]">(optional)</span>
              </label>
              <textarea
                id="settings-channel-description"
                className="min-h-24 w-full resize-none rounded-lg border border-[#c8d1d7] bg-white px-3 py-2 text-sm outline-none transition focus-visible:border-[#073f43] focus-visible:ring-2 focus-visible:ring-[#073f43]/20"
                placeholder="What should members discuss here?"
                value={channelDescription}
                onChange={(e) => setChannelDescription(e.target.value)}
              />
            </div>

            {createChannelMutation.error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {getErrorMessage(createChannelMutation.error, "Could not create channel.")}
              </p>
            ) : createChannelMutation.isSuccess ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                Channel created!
              </p>
            ) : null}

            <Button
              className="w-full rounded-xl bg-[#073f43] font-semibold text-white hover:bg-[#052c2f]"
              disabled={!channelName.trim() || createChannelMutation.isPending}
            >
              <Plus className="size-4" />
              {createChannelMutation.isPending ? "Creating..." : "Create channel"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Feed Tab ─────────────────────────────────────────────────────────────────

function FeedTab({ groupId }: { groupId: number }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const feedQuery = useQuery({
    queryKey: ["groups", groupId, "feed"],
    queryFn: () => feedApi.getFeed({ groupId, limit: 10 }),
    retry: false,
  });

  const createPostMutation = useMutation({
    mutationFn: async (postContent: string) => {
      const imageUrls = files.length ? await cloudinaryApi.uploadImages(files) : undefined;

      return feedApi.createPost({
        content: postContent,
        visibility: "GROUP",
        post_type: "TEXT",
        group_id: groupId,
        images: imageUrls,
      });
    },
    onSuccess: () => {
      setContent("");
      setFiles([]);
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ["groups", groupId, "feed"] });
    },
    onError: (caughtError) => {
      setError(getErrorMessage(caughtError, "Could not create group post."));
    },
  });

  function handleCreateGroupPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError("Write something before posting.");
      return;
    }

    createPostMutation.mutate(trimmedContent);
  }

  function handleFileChange(selectedFiles: FileList | null) {
    const imageFiles = Array.from(selectedFiles ?? [])
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 5);

    setFiles(imageFiles);
    setError(null);
  }

  const composer = (
    <form
      className="overflow-hidden rounded-2xl border border-[#d6dde3] bg-white p-4 shadow-sm"
      onSubmit={handleCreateGroupPost}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => handleFileChange(event.target.files)}
      />
      <div className="flex gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#073f43] text-white">
          <MessageSquare className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <textarea
            className="min-h-24 w-full resize-none rounded-xl border border-[#d6dde3] bg-[#f8fafc] px-3 py-2 text-sm leading-6 text-[#101820] outline-none transition focus:border-[#073f43] focus:bg-white"
            placeholder="Post an update to this group..."
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              setError(null);
            }}
            maxLength={1000}
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-destructive">{error ?? ""}</p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-[#c8d1d7]"
                onClick={() => fileInputRef.current?.click()}
                disabled={createPostMutation.isPending}
              >
                <Image className="size-4" />
                Images
              </Button>
              <Button
                className="bg-[#073f43] text-white hover:bg-[#062f33]"
                disabled={createPostMutation.isPending || !content.trim()}
              >
                <Send className="size-4" />
                {createPostMutation.isPending ? "Posting..." : "Post to group"}
              </Button>
            </div>
          </div>
          {files.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {files.map((file) => (
                <span
                  key={`${file.name}-${file.lastModified}`}
                  className="rounded-lg border border-[#b8c4c7] bg-[#eef3fb] px-2.5 py-1 text-xs font-medium text-[#172b2e]"
                >
                  {file.name}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </form>
  );

  if (feedQuery.isLoading) {
    return (
      <div className="space-y-3">
        {composer}
        <div className="overflow-hidden rounded-2xl border border-[#d6dde3] bg-white p-5 shadow-sm">
          <p className="text-sm text-[#7a8e91]">Loading group feed...</p>
        </div>
      </div>
    );
  }

  const posts = feedQuery.data?.data ?? [];

  if (!posts.length) {
    return (
      <div className="space-y-3">
        {composer}
        <div className="overflow-hidden rounded-2xl border border-[#d6dde3] bg-white p-8 text-center shadow-sm">
          <Zap className="mx-auto size-10 text-[#c8d1d7]" />
          <h2 className="mt-3 text-base font-semibold text-[#101820]">No group posts yet</h2>
          <p className="mt-2 text-sm leading-6 text-[#7a8e91]">
            Group posts will appear here when members publish to this group.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {composer}
      {posts.map((post: FeedPost) => (
        <div
          key={post.id}
          className="overflow-hidden rounded-2xl border border-[#d6dde3] bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <Avatar initials={`${post.user.first_name[0]}${post.user.last_name[0]}`} />
              <div>
                <p className="font-semibold text-[#101820]">
                  {post.user.first_name} {post.user.last_name}
                </p>
                <p className="text-xs font-medium uppercase tracking-wide text-[#7a8e91]">
                  Group post
                </p>
              </div>
            </div>
            <button className="text-[#c8d1d7] transition hover:text-[#7a8e91]">
              <MoreVertical className="size-4" />
            </button>
          </div>
          <p className="mt-4 text-sm leading-7 text-[#1f2937]">{post.content}</p>
          {post.images.length ? (
            <div className="mt-4 grid gap-2">
              {post.images.slice(0, 2).map((image) => (
                <img
                  key={image.id}
                  src={image.file_path}
                  alt=""
                  className="max-h-80 w-full rounded-xl border border-[#d6dde3] object-cover"
                />
              ))}
            </div>
          ) : null}
          <div className="mt-4 flex gap-5 border-t border-[#f3f6fb] pt-3 text-sm text-[#7a8e91]">
            <span>{post.stats.reactions} reactions</span>
            <span>{post.stats.comments} comments</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Channels Tab ─────────────────────────────────────────────────────────────

function ChannelsTab({ group }: { group: Group }) {
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
      <div className="grid min-h-[36rem] lg:grid-cols-[13rem_minmax(0,1fr)]">
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

// ─── Members Tab ──────────────────────────────────────────────────────────────

function MembersTab({ groupId }: { groupId: number }) {
  const onlineUserIds = useOnlineUserIds();
  const membersQuery = useQuery({
    queryKey: ["groups", groupId, "members"],
    queryFn: () => groupsApi.getGroupMembers(groupId),
    retry: false,
  });
  const members = membersQuery.data ?? EMPTY_MEMBERS;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d6dde3] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#edf3fb] px-5 py-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-[#101820]">
          <Users className="size-4 text-[#073f43]" />
          Members
        </h2>
        <span className="rounded-full bg-[#073f43] px-2.5 py-0.5 text-xs font-bold text-white">
          {members.length}
        </span>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2">
        {membersQuery.isLoading ? (
          <p className="text-sm text-[#7a8e91]">Loading members...</p>
        ) : members.length ? (
          members.map((member) => {
            const isOnline = onlineUserIds.has(member.user_id);
            return (
              <div
                key={member.user_id}
                className="flex items-center gap-3 rounded-xl border border-[#edf3fb] bg-[#f8fafc] p-3 transition hover:border-[#d6dde3] hover:bg-white"
              >
                <div className="relative">
                  <Avatar initials={`${member.user.first_name[0]}${member.user.last_name[0]}`} />
                  <span
                    aria-label={isOnline ? "Online" : "Offline"}
                    className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white ${
                      isOnline ? "bg-emerald-500" : "bg-[#c8d1d7]"
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#101820]">
                    {member.user.first_name} {member.user.last_name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[#7a8e91]">{member.role ?? "member"}</span>
                    <span className="text-[#c8d1d7]">·</span>
                    <span className={`text-xs font-semibold ${isOnline ? "text-emerald-600" : "text-[#aab7ba]"}`}>
                      {isOnline ? "online" : "offline"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-[#7a8e91]">No members found.</p>
        )}
      </div>
    </div>
  );
}

// ─── About Tab ────────────────────────────────────────────────────────────────

function AboutTab({ group }: { group: Group }) {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_17rem]">
      <div className="overflow-hidden rounded-2xl border border-[#d6dde3] bg-white shadow-sm">
        <div className="border-b border-[#edf3fb] px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-[#101820]">
            <Info className="size-4 text-[#073f43]" />
            About {group.name}
          </h2>
        </div>
        <div className="space-y-4 p-5">
          <p className="text-sm leading-7 text-[#1f2937]">{getGroupDescription(group)}</p>
          <div className="rounded-xl bg-[#f3f6fb] p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#7a8e91]">Community focus</p>
            <p className="mt-2 text-sm leading-6 text-[#3d5156]">
              Resource sharing, course collaboration, academic discussion, and project coordination.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#d6dde3] bg-white shadow-sm">
        <div className="border-b border-[#edf3fb] px-5 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#7a8e91]">Details</h2>
        </div>
        <div className="divide-y divide-[#f3f6fb]">
          {[
            { label: "Created",    value: formatDate(group.created_at) },
            { label: "Visibility", value: group.visibility ?? "public" },
            { label: "Owner ID",   value: String(group.owner_id) },
          ].map(({ label, value }) => (
            <div key={label} className="px-5 py-3.5">
              <p className="text-xs font-bold uppercase tracking-wide text-[#7a8e91]">{label}</p>
              <p className="mt-1 text-sm font-semibold text-[#101820]">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Selected Group View ──────────────────────────────────────────────────────

function SelectedGroupView({
  group,
  activeTab,
  onTabChange,
}: {
  group: Group;
  activeTab: GroupTab;
  onTabChange: (tab: GroupTab) => void;
}) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <GroupHero
        group={group}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {activeTab === "feed"     && <FeedTab groupId={group.id} />}
      {activeTab === "channels" && <ChannelsTab group={group} />}
      {activeTab === "members"  && <MembersTab groupId={group.id} />}
      {activeTab === "about"    && <AboutTab group={group} />}

      {isSettingsOpen && (
        <GroupSettingsModal group={group} onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
}

// ─── Right Rail ───────────────────────────────────────────────────────────────

function CreateGroupCompactCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-dashed border-[#c8d1d7] bg-white p-4 transition hover:border-[#073f43]/40 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#ffc85c]">
          <Plus className="size-4 text-[#6b4a05]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#101820]">Create a new group</h3>
          <p className="mt-1 text-xs leading-5 text-[#7a8e91]">
            Start a class, research team, or project community.
          </p>
        </div>
      </div>
    </div>
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
    <div className="space-y-4">
      <GroupList
        memberships={memberships}
        selectedGroupId={selectedGroupId}
        onSelectGroup={onSelectGroup}
      />
      <CreateGroupCompactCard />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function MyGroupsPage() {
  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>();
  const [activeTab, setActiveTab] = useState<GroupTab>("channels");

  const myGroupsQuery = useQuery({
    queryKey: ["groups", "my"],
    queryFn: groupsApi.getMyGroups,
    retry: false,
  });

  const memberships = myGroupsQuery.data ?? EMPTY_MEMBERSHIPS;

  const selectedMembership = useMemo(
    () => memberships.find((m) => m.group.id === selectedGroupId) ?? memberships[0],
    [memberships, selectedGroupId]
  );

  if (myGroupsQuery.isLoading) {
    return (
      <AppShell activeItem="My Groups">
        <div className="overflow-hidden rounded-2xl border border-[#d6dde3] bg-white p-5 shadow-sm">
          <p className="text-sm text-[#7a8e91]">Loading your groups...</p>
        </div>
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
      <div className="mx-auto w-full max-w-[58rem] py-4">
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
