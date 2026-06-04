import { Router } from "express";
import notificationController from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validateParams } from "../middleware/validateParams.middleware";
import { NotificationIdParamDto } from "../../business/dto/notifications.dto";

const router = Router();

// GET  /notifications          — fetch all notifications
router.get("/", authenticate, notificationController.getMyNotifications);

// PATCH /notifications/read    — mark one or all as read (frontend sends { notificationIds: [] } or { all: true })
router.patch("/read", authenticate, notificationController.markAsRead);

// DELETE /notifications/:id
router.delete(
  "/:id",
  authenticate,
  validateParams(NotificationIdParamDto),
  notificationController.deleteNotification,
);

export default router;