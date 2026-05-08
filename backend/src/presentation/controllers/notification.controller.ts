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

      res.status(200).json(notifications);
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.markAsRead(
        req.user.userId,
        Number(req.params.id),
      );

      res.status(200).json(notification);
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.markAllAsRead(req.user.userId);
      res.status(200).json(result);
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
