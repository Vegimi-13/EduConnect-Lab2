import { Router } from "express";
import livekitController from "../controllers/livekit.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/private/:conversationId/token", authenticate, livekitController.privateCallToken);
router.post("/channels/:channelId/token", authenticate, livekitController.channelCallToken);

export default router;
