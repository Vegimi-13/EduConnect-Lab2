import { api } from "@/lib/axios";
import type {
  MarkReadPayload,
  Notification,
  NotificationsResponse,
} from "../types/notification.types";

async function getNotifications(params?: {
  page?: number;
  limit?: number;
  unread?: boolean;
}): Promise<NotificationsResponse> {
  const { data } = await api.get<NotificationsResponse>("/notifications", {
    params,
  });
  return data;
}

async function markAsRead(payload: MarkReadPayload): Promise<void> {
  await api.patch("/notifications/read", payload);
}

async function markAllAsRead(): Promise<void> {
  await api.patch("/notifications/read", { all: true });
}

async function getUnreadCount(): Promise<{ count: number }> {
  const { data } = await api.get<{ count: number }>("/notifications/unread-count");
  return data;
}

async function acceptFollowRequest(notificationId: number, senderId: number): Promise<void> {
  await api.put(`/follow/${senderId}/accept`);
  await markAsRead({ notificationIds: [notificationId] });
}

async function declineFollowRequest(notificationId: number, senderId: number): Promise<void> {
  await api.put(`/follow/${senderId}/reject`);
  await markAsRead({ notificationIds: [notificationId] });
}

export const notificationsApi = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  acceptFollowRequest,
  declineFollowRequest,
};
