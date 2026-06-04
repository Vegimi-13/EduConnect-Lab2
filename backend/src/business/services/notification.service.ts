import notificationRepository from "../../persistence/repositories/notification.repository";
import type { NotificationType } from "../../shared/constants/enum";
import {
  emitAllNotificationsRead,
  emitNotificationCreated,
  emitNotificationDeleted,
  emitNotificationRead,
} from "../../websocket/handlers/notification.handler";

type CreateNotificationData = {
  user_id: number;
  sender_id?: number;       
  type: NotificationType;
  title?: string;
  message?: string;
};

const notificationService = {
  async notify(data: CreateNotificationData) {
    const notification = await notificationRepository.create(data);
    emitNotificationCreated(data.user_id, notification);
    return notification;
  },

  async getMyNotifications(user_id: number, onlyUnread = false) {
    return notificationRepository.findByUserId(user_id, onlyUnread);
  },

  async markAsRead(user_id: number, notificationId: number) {
    const notification = await notificationRepository.findById(notificationId);

    if (!notification || notification.user_id !== user_id) {
      throw new Error("Notification not found");
    }

    const updatedNotification = await notificationRepository.markAsRead(notificationId);
    emitNotificationRead(user_id, updatedNotification);
    return updatedNotification;
  },

  async markAllAsRead(user_id: number) {
    const result = await notificationRepository.markAllAsRead(user_id);
    emitAllNotificationsRead(user_id, result);
    return result;
  },

  async deleteNotification(user_id: number, notificationId: number) {
    const notification = await notificationRepository.findById(notificationId);

    if (!notification || notification.user_id !== user_id) {
      throw new Error("Notification not found");
    }

    const deleted = await notificationRepository.delete(notificationId);
    emitNotificationDeleted(user_id, notificationId);
    return deleted;
  },
};

export default notificationService;