import { Request, Response, NextFunction } from "express";
import notificationService from "../../business/services/notification.service";
import { NotificationQueryDto } from "../../business/dto/notifications.dto";

const notificationController = {
  async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const query = NotificationQueryDto.parse(req.query);
      const notifications = await notificationService.getMyNotifications(
        req.user.userId,
        query.unread,
      );

      const unreadCount = notifications.filter((n) => !n.is_read).length;

      // Shape the response to match the frontend's NotificationsResponse type
      res.status(200).json({
        data: notifications,
        meta: {
          page: 1,
          limit: notifications.length,
          total: notifications.length,
          totalPages: 1,
          hasNextPage: false,
          unreadCount,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await notificationService.getUnreadCount(req.user.userId);
      res.status(200).json({ count });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /notifications/read  — matches frontend's markAsRead & markAllAsRead calls
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { notificationIds, all } = req.body as {
        notificationIds?: number[];
        all?: boolean;
      };

      if (all) {
        const result = await notificationService.markAllAsRead(req.user.userId);
        return res.status(200).json(result);
      }

      if (notificationIds?.length) {
        const updated = await Promise.all(
          notificationIds.map((id) =>
            notificationService.markAsRead(req.user.userId, id)
          )
        );
        return res.status(200).json(updated);
      }

      res.status(400).json({ message: "Provide notificationIds or all: true" });
    } catch (error) {
      next(error);
    }
  },

  async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.deleteNotification(
        req.user.userId,
        Number(req.params.id),
      );

      res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
      next(error);
    }
  },
};

export default notificationController;
