import {
  Bell,
  Check,
  CheckCheck,
  FileText,
  Heart,
  MessageSquare,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { notificationsApi } from "../api/notificationsApi";
import type { Notification, NotificationType } from "../types/notification.types";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
    new Date(dateStr)
  );
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

const notificationIconMap: Record<NotificationType, React.ElementType> = {
  FOLLOW_REQUEST: UserPlus,
  FOLLOW_ACCEPTED: UserCheck,
  POST_LIKE: Heart,
  POST_COMMENT: MessageSquare,
  COMMENT_REPLY: MessageSquare,
  MENTION: MessageSquare,
  GROUP_INVITE: Users,
  GROUP_POST: FileText,
  SYSTEM: Bell,
};

const notificationColorMap: Record<NotificationType, string> = {
  FOLLOW_REQUEST: "bg-blue-100 text-blue-600",
  FOLLOW_ACCEPTED: "bg-green-100 text-green-600",
  POST_LIKE: "bg-red-100 text-red-500",
  POST_COMMENT: "bg-teal-100 text-teal-600",
  COMMENT_REPLY: "bg-teal-100 text-teal-600",
  MENTION: "bg-purple-100 text-purple-600",
  GROUP_INVITE: "bg-orange-100 text-orange-500",
  GROUP_POST: "bg-yellow-100 text-yellow-600",
  SYSTEM: "bg-gray-100 text-gray-500",
};

// ─── Avatar ─────────────────────────────────────────────────────────────────

function Avatar({ notification }: { notification: Notification }) {
  const type = notification.type;
  const Icon = notificationIconMap[type] ?? Bell;
  const colorClass = notificationColorMap[type] ?? "bg-gray-100 text-gray-500";

  if (!notification.sender) {
    return (
      <div
        className={`flex size-11 shrink-0 items-center justify-center rounded-full ${colorClass}`}
      >
        <Icon className="size-5" />
      </div>
    );
  }

  return (
    <div className="relative shrink-0">
      <div className="flex size-11 items-center justify-center rounded-full bg-[#0b4f53] text-sm font-bold text-white">
        {getSenderInitials(notification)}
      </div>
      <span
        className={`absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full ${colorClass} border-2 border-white`}
      >
        <Icon className="size-2.5" />
      </span>
    </div>
  );
}

// ─── Notification Item ───────────────────────────────────────────────────────

function NotificationItem({
  notification,
  onMarkRead,
  onAccept,
  onDecline,
}: {
  notification: Notification;
  onMarkRead: (id: number) => void;
  onAccept: (notifId: number, senderId: number) => void;
  onDecline: (notifId: number, senderId: number) => void;
}) {
  const isFollowRequest = notification.type === "FOLLOW_REQUEST";

  return (
    <div
      className={`flex items-start gap-3.5 rounded-xl px-4 py-3.5 transition hover:bg-[#f0f5fb] ${
        !notification.is_read ? "bg-[#edf4fc]" : "bg-white"
      }`}
    >
      <Avatar notification={notification} />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {notification.sender && (
              <span className="font-semibold text-[#101820]">
                {getSenderName(notification)}{" "}
              </span>
            )}
            <span className="text-sm text-[#374445]">{notification.message}</span>

            {getSenderMeta(notification) && (
              <p className="mt-0.5 text-xs text-[#6b7d7e]">
                {getSenderMeta(notification)}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xs text-[#8a9a9c] whitespace-nowrap">
              {formatTime(notification.created_at)}
            </span>
            {!notification.is_read && (
              <button
                onClick={() => onMarkRead(notification.id)}
                className="text-[#8a9a9c] hover:text-[#073f43] transition"
                title="Mark as read"
              >
                <div className="size-2.5 rounded-full bg-[#073f43]" />
              </button>
            )}
          </div>
        </div>

        {isFollowRequest && notification.sender && (
          <div className="mt-2.5 flex gap-2">
            <Button
              size="sm"
              className="h-8 bg-[#073f43] px-4 text-xs text-white hover:bg-[#062f33]"
              onClick={() => onAccept(notification.id, notification.sender!.id)}
            >
              <Check className="size-3.5" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-4 text-xs"
              onClick={() => onDecline(notification.id, notification.sender!.id)}
            >
              Decline
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab ────────────────────────────────────────────────────────────────────

type Tab = "all" | "unread" | "requests";

function TabBar({
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
    { id: "all", label: "All" },
    { id: "unread", label: "Unread", count: unreadCount },
    { id: "requests", label: "Requests", count: requestCount },
  ];

  return (
    <div className="flex gap-1 border-b border-[#dde4e8]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-1.5 border-b-2 px-4 pb-3 pt-1 text-sm font-medium transition ${
            active === tab.id
              ? "border-[#073f43] text-[#073f43]"
              : "border-transparent text-[#5a6b6d] hover:text-[#101820]"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && tab.count > 0 && (
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                active === tab.id
                  ? "bg-[#073f43] text-white"
                  : "bg-[#dde4e8] text-[#374445]"
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: Tab }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-[#edf3fb]">
        <Bell className="size-7 text-[#8a9a9c]" />
      </div>
      <p className="font-medium text-[#374445]">
        {tab === "requests"
          ? "No pending requests"
          : tab === "unread"
          ? "You're all caught up!"
          : "No notifications yet"}
      </p>
      <p className="mt-1 text-sm text-[#8a9a9c]">
        {tab === "requests"
          ? "Follow requests will appear here."
          : "We'll notify you when something happens."}
      </p>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.getNotifications({ limit: 50 }),
  });

  const markReadMutation = useMutation({
    mutationFn: (ids: number[]) =>
      notificationsApi.markAsRead({ notificationIds: ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: ({ notifId, senderId }: { notifId: number; senderId: number }) =>
      notificationsApi.acceptFollowRequest(notifId, senderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const declineMutation = useMutation({
    mutationFn: ({ notifId, senderId }: { notifId: number; senderId: number }) =>
      notificationsApi.declineFollowRequest(notifId, senderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const allNotifications = data?.data ?? [];
  const unreadCount = data?.meta?.unreadCount ?? 0;
  const requestNotifications = allNotifications.filter(
    (n) => n.type === "FOLLOW_REQUEST"
  );

  const visibleNotifications =
    activeTab === "all"
      ? allNotifications
      : activeTab === "unread"
      ? allNotifications.filter((n) => !n.is_read)
      : requestNotifications;

  function handleMarkRead(id: number) {
    markReadMutation.mutate([id]);
  }

  function handleAccept(notifId: number, senderId: number) {
    acceptMutation.mutate({ notifId, senderId });
  }

  function handleDecline(notifId: number, senderId: number) {
    declineMutation.mutate({ notifId, senderId });
  }

  return (
    <AppShell activeItem="Notifications">
      <div className="mx-auto max-w-2xl py-2">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#101820]">Notifications</h1>
            <p className="mt-1 text-sm text-[#5a6b6d]">
              Stay updated with your academic community activity.
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
            >
              <CheckCheck className="size-3.5" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Tabs */}
        <TabBar
          active={activeTab}
          onChange={setActiveTab}
          unreadCount={unreadCount}
          requestCount={requestNotifications.length}
        />

        {/* List */}
        <Card className="mt-4 overflow-hidden border-[#dde4e8] shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-px divide-y divide-[#edf0f2]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3.5 px-4 py-3.5">
                    <div className="size-11 animate-pulse rounded-full bg-[#e4eaf0]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-3/4 animate-pulse rounded bg-[#e4eaf0]" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-[#e4eaf0]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visibleNotifications.length === 0 ? (
              <EmptyState tab={activeTab} />
            ) : (
              <div className="divide-y divide-[#edf0f2]">
                {visibleNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
