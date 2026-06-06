import { prisma } from "../../database/prismaClients";
import type { NotificationType } from "../../shared/constants/enum";

type CreateNotificationData = {
  user_id: number;
  sender_id?: number;        // ← added
  type: NotificationType;
  title?: string;
  message?: string;
};

// Reusable include so sender data is always shaped the same way
const notificationInclude = {
  sender: {
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      profile: {
        select: {
          headline: true,
        },
      },
    },
  },
} as const;

const notificationRepository = {
  async create(data: CreateNotificationData) {
    return prisma.notification.create({
      data,
      include: notificationInclude,  
    });
  },

  async findByUserId(user_id: number, onlyUnread = false) {
    return prisma.notification.findMany({
      where: {
        user_id,
        ...(onlyUnread && { is_read: false }),
      },
      orderBy: { created_at: "desc" },
      include: notificationInclude,  
    });
  },

  async countUnreadByUserId(user_id: number) {
    return prisma.notification.count({
      where: {
        user_id,
        is_read: false,
      },
    });
  },

  async findById(id: number) {
    return prisma.notification.findUnique({
      where: { id },
      include: notificationInclude,
    });
  },

  async markAsRead(id: number) {
    return prisma.notification.update({
      where: { id },
      data: { is_read: true },
      include: notificationInclude,
    });
  },

  async markAllAsRead(user_id: number) {
    
    await prisma.notification.updateMany({
      where: { user_id, is_read: false },
      data: { is_read: true },
    });
    return prisma.notification.findMany({
      where: { user_id },
      orderBy: { created_at: "desc" },
      include: notificationInclude,
    });
  },

  async delete(id: number) {
    return prisma.notification.delete({
      where: { id },
    });
  },
};

export default notificationRepository;
