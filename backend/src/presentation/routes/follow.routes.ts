import { Router } from "express";
import followController from "../controllers/follow.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/:userId", authenticate, followController.sendFollowRequest);

router.delete("/:userId", authenticate, followController.removeFollow);

router.put("/:userId/accept", authenticate, followController.acceptFollowRequest);

router.put("/:userId/reject", authenticate, followController.rejectFollowRequest);

router.get("/followers/:userId", followController.getFollowers);

router.get("/following/:userId", followController.getFollowing);

router.get("/requests/pending", authenticate, followController.getPendingRequests);

export default router;