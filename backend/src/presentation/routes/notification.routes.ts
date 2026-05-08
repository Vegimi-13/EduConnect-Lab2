import { Router } from "express";
import notificationController from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validateParams } from "../middleware/validateParams.middleware";
import { NotificationIdParamDto } from "../../business/dto/notifications.dto";

const router = Router();

router.get("/", authenticate, notificationController.getMyNotifications);
router.put("/read-all", authenticate, notificationController.markAllAsRead);
router.put(
  "/:id/read",
  authenticate,
  validateParams(NotificationIdParamDto),
  notificationController.markAsRead,
);
router.delete(
  "/:id",
  authenticate,
  validateParams(NotificationIdParamDto),
  notificationController.deleteNotification,
);

export default router;
