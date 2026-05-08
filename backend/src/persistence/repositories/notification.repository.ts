import { prisma } from "../../database/prismaClients";
import type { NotificationType } from "../../shared/constants/enum";

type CreateNotificationData = {
  user_id: number;
  type: NotificationType;
  title?: string;
  message?: string;
};

const notificationRepository = {
  async create(data: CreateNotificationData) {
    return prisma.notification.create({
      data,
    });
  },

  async findByUserId(user_id: number, onlyUnread = false) {
    return prisma.notification.findMany({
      where: {
        user_id,
        ...(onlyUnread && { is_read: false }),
      },
      orderBy: { created_at: "desc" },
    });
  },

  async findById(id: number) {
    return prisma.notification.findUnique({
      where: { id },
    });
  },

  async markAsRead(id: number) {
    return prisma.notification.update({
      where: { id },
      data: { is_read: true },
    });
  },

  async markAllAsRead(user_id: number) {
    return prisma.notification.updateMany({
      where: {
        user_id,
        is_read: false,
      },
      data: { is_read: true },
    });
  },

  async delete(id: number) {
    return prisma.notification.delete({
      where: { id },
    });
  },
};

export default notificationRepository;
