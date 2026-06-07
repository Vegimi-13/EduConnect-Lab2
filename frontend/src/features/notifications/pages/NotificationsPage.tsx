import {
  Bell,
  Check,
  CheckCheck,
  Heart,
  MessageSquare,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/AppShell";
import { notificationsApi } from "../api/notificationsApi";
import type { Notification, NotificationType } from "../types/notification.types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d`;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(dateStr));
}

function getSenderName(n: Notification) {
  if (!n.sender) return "Someone";
  return `${n.sender.first_name} ${n.sender.last_name}`.trim();
}

function getSenderInitials(n: Notification) {
  if (!n.sender) return "?";
  return `${n.sender.first_name?.[0] ?? ""}${n.sender.last_name?.[0] ?? ""}`.toUpperCase();
}

function getSenderMeta(n: Notification) {
  return n.sender?.profile?.headline ?? n.sender?.email ?? "";
}

// Icon + accent color per notification type — all on-brand, no random tailwind colors
const typeConfig: Record<NotificationType, { icon: React.ElementType; bg: string; fg: string }> = {
  FOLLOW_REQUEST:      { icon: UserPlus,     bg: "bg-[#e6f0fb]", fg: "text-[#1a56a0]" },
  FOLLOW_ACCEPTED:     { icon: UserCheck,    bg: "bg-[#e4f5ee]", fg: "text-[#0e6640]" },
  POST_REACTION:       { icon: Heart,        bg: "bg-[#fde8e8]", fg: "text-[#c0392b]" },
  POST_COMMENT:        { icon: MessageSquare,bg: "bg-[#e3f4f4]", fg: "text-[#073f43]" },
  COMMENT_REACTION:    { icon: Heart,        bg: "bg-[#fde8e8]", fg: "text-[#c0392b]" },
  GROUP_JOIN_REQUEST:  { icon: Users,        bg: "bg-[#fef3e2]", fg: "text-[#8a5a00]" },
  GROUP_JOIN_ACCEPTED: { icon: UserCheck,    bg: "bg-[#e4f5ee]", fg: "text-[#0e6640]" },
  GROUP_JOIN_REJECTED: { icon: X,            bg: "bg-[#f1f3f5]", fg: "text-[#5a6b6d]" },
  MESSAGE:             { icon: MessageSquare,bg: "bg-[#ede8fb]", fg: "text-[#4f33a0]" },
};

// ─── Sender Avatar with type badge ───────────────────────────────────────────

function Avatar({ notification }: { notification: Notification }) {
  const cfg = typeConfig[notification.type] ?? { icon: Bell, bg: "bg-[#f1f3f5]", fg: "text-[#5a6b6d]" };
  const Icon = cfg.icon;

  if (!notification.sender) {
    return (
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}>
        <Icon className={`size-4 ${cfg.fg}`} />
      </div>
    );
  }

  return (
    <div className="relative shrink-0">
      <div className="flex size-10 items-center justify-center rounded-full bg-[#073f43] text-xs font-bold text-white">
        {getSenderInitials(notification)}
      </div>
      <span className={`absolute -bottom-0.5 -right-0.5 flex size-[18px] items-center justify-center rounded-full border-2 border-white ${cfg.bg}`}>
        <Icon className={`size-2.5 ${cfg.fg}`} />
      </span>
    </div>
  );
}

// ─── Single notification row ─────────────────────────────────────────────────

function NotificationRow({
  notification,
  onMarkRead,
  onAccept,
  onDecline,
  isAccepting,
  isDeclining,
}: {
  notification: Notification;
  onMarkRead: (id: number) => void;
  onAccept: (notifId: number, senderId: number) => void;
  onDecline: (notifId: number, senderId: number) => void;
  isAccepting: boolean;
  isDeclining: boolean;
}) {
  const isFollowRequest = notification.type === "FOLLOW_REQUEST";
  const isActing = isAccepting || isDeclining;
  const isUnread = !notification.is_read;

  return (
    <div
      className={`group relative flex gap-3.5 px-5 py-4 transition-colors ${
        isUnread
          ? "bg-[#f0f7ff] hover:bg-[#e8f2fc]"
          : "bg-white hover:bg-[#f7f9fb]"
      }`}
    >
      {/* Unread indicator strip */}
      {isUnread && (
        <span className="absolute left-0 top-0 h-full w-[3px] rounded-r-full bg-[#073f43]" />
      )}

      <Avatar notification={notification} />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm leading-snug text-[#2d3b3d]">
            {notification.sender && (
              <span className="font-semibold text-[#101820]">
                {getSenderName(notification)}{" "}
              </span>
            )}
            <span>{notification.message}</span>
          </p>

          <div className="flex shrink-0 items-center gap-2 pt-0.5">
            <span className="text-[11px] font-medium text-[#8a9a9c]">
              {formatTime(notification.created_at)}
            </span>
            {isUnread && (
              <button
                onClick={() => onMarkRead(notification.id)}
                title="Mark as read"
                className="size-2 shrink-0 rounded-full bg-[#073f43] opacity-80 transition hover:opacity-100"
              />
            )}
          </div>
        </div>

        {getSenderMeta(notification) && (
          <p className="mt-0.5 text-xs text-[#8a9a9c]">{getSenderMeta(notification)}</p>
        )}

        {/* Follow request actions */}
        {isFollowRequest && notification.sender && isUnread && (
          <div className="mt-3 flex gap-2">
            <button
              className="flex h-7 items-center gap-1.5 rounded-lg bg-[#073f43] px-3.5 text-xs font-semibold text-white transition hover:bg-[#062f33] disabled:opacity-50"
              onClick={() => onAccept(notification.id, notification.sender!.id)}
              disabled={isActing}
            >
              {isAccepting ? (
                <span className="animate-pulse">Accepting…</span>
              ) : (
                <><Check className="size-3" /> Accept</>
              )}
            </button>
            <button
              className="flex h-7 items-center rounded-lg border border-[#c8d1d7] bg-white px-3.5 text-xs font-semibold text-[#374445] transition hover:border-[#b0bcbf] hover:bg-[#f5f8fa] disabled:opacity-50"
              onClick={() => onDecline(notification.id, notification.sender!.id)}
              disabled={isActing}
            >
              {isDeclining ? <span className="animate-pulse">Declining…</span> : "Decline"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = "all" | "unread" | "requests";

function Tabs({
  active,
  onChange,
  unreadCount,
  requestCount,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
  unreadCount: number;
  requestCount: number;
}) {
  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "all",      label: "All" },
    { id: "unread",   label: "Unread",   count: unreadCount },
    { id: "requests", label: "Requests", count: requestCount },
  ];

  return (
    <div className="flex border-b border-[#dde6ea]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative flex items-center gap-2 px-5 pb-3 pt-0.5 text-sm font-medium transition-colors ${
            active === tab.id
              ? "text-[#073f43]"
              : "text-[#6b7d7e] hover:text-[#2d3b3d]"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && tab.count > 0 && (
            <span
              className={`rounded-full px-1.5 py-px text-[10px] font-bold leading-4 ${
                active === tab.id
                  ? "bg-[#073f43] text-white"
                  : "bg-[#e0e8ec] text-[#374445]"
              }`}
            >
              {tab.count}
            </span>
          )}
          {active === tab.id && (
            <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-[#073f43]" />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3.5 bg-white px-5 py-4">
          <div className="size-10 shrink-0 animate-pulse rounded-full bg-[#e4eaf0]" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3.5 w-2/3 animate-pulse rounded-md bg-[#e4eaf0]" />
            <div className="h-3 w-2/5 animate-pulse rounded-md bg-[#edf0f2]" />
          </div>
        </div>
      ))}
    </>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: Tab }) {
  const copy = {
    all:      { title: "All quiet here",        sub: "We'll let you know when something happens." },
    unread:   { title: "You're all caught up",  sub: "Nothing new to see right now." },
    requests: { title: "No pending requests",   sub: "Follow requests will show up here." },
  }[tab];

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[#edf3fb]">
        <Bell className="size-6 text-[#8a9a9c]" />
      </div>
      <p className="text-sm font-semibold text-[#2d3b3d]">{copy.title}</p>
      <p className="mt-1 text-xs text-[#8a9a9c]">{copy.sub}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [actingOn, setActingOn] = useState<Record<number, "accepting" | "declining">>({});
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.getNotifications({ limit: 50 }),
  });

  const markReadMutation = useMutation({
    mutationFn: (ids: number[]) => notificationsApi.markAsRead({ notificationIds: ids }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const acceptMutation = useMutation({
    mutationFn: ({ notifId, senderId }: { notifId: number; senderId: number }) =>
      notificationsApi.acceptFollowRequest(notifId, senderId),
    onSettled: (_d, _e, { notifId }) => {
      setActingOn((p) => { const n = { ...p }; delete n[notifId]; return n; });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["follow"] });
    },
  });

  const declineMutation = useMutation({
    mutationFn: ({ notifId, senderId }: { notifId: number; senderId: number }) =>
      notificationsApi.declineFollowRequest(notifId, senderId),
    onSettled: (_d, _e, { notifId }) => {
      setActingOn((p) => { const n = { ...p }; delete n[notifId]; return n; });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["follow"] });
    },
  });

  const allNotifications = data?.data ?? [];
  const unreadCount = data?.meta?.unreadCount ?? 0;
  const pendingRequests = allNotifications.filter((n) => n.type === "FOLLOW_REQUEST" && !n.is_read);

  const visibleNotifications =
    activeTab === "all"      ? allNotifications :
    activeTab === "unread"   ? allNotifications.filter((n) => !n.is_read) :
                               allNotifications.filter((n) => n.type === "FOLLOW_REQUEST");

  return (
    <AppShell activeItem="Notifications">
      <div className="mx-auto max-w-2xl py-6">

        {/* Page header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#101820]">Notifications</h1>
            <p className="mt-0.5 text-xs text-[#6b7d7e]">Stay updated with your academic community.</p>
          </div>
          {unreadCount > 0 && (
            <button
              className="flex items-center gap-1.5 rounded-lg border border-[#c8d6dc] bg-white px-3 py-1.5 text-xs font-semibold text-[#374445] shadow-sm transition hover:border-[#073f43] hover:text-[#073f43] disabled:opacity-50"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-[#d0dbe2] bg-white shadow-sm">

          {/* Tabs */}
          <div className="px-1 pt-3">
            <Tabs
              active={activeTab}
              onChange={setActiveTab}
              unreadCount={unreadCount}
              requestCount={pendingRequests.length}
            />
          </div>

          {/* List */}
          <div className="divide-y divide-[#eef1f3]">
            {isLoading ? (
              <SkeletonRows />
            ) : visibleNotifications.length === 0 ? (
              <EmptyState tab={activeTab} />
            ) : (
              visibleNotifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onMarkRead={(id) => markReadMutation.mutate([id])}
                  onAccept={(notifId, senderId) => {
                    setActingOn((p) => ({ ...p, [notifId]: "accepting" }));
                    acceptMutation.mutate({ notifId, senderId });
                  }}
                  onDecline={(notifId, senderId) => {
                    setActingOn((p) => ({ ...p, [notifId]: "declining" }));
                    declineMutation.mutate({ notifId, senderId });
                  }}
                  isAccepting={actingOn[notification.id] === "accepting"}
                  isDeclining={actingOn[notification.id] === "declining"}
                />
              ))
            )}
          </div>
        </div>

      </div>
    </AppShell>
  );
}