import { Router } from "express";
import groupController from "../controllers/group.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, groupController.createGroup);
router.get("/my", authenticate, groupController.getMyGroups);

router.post("/:id/join", authenticate, groupController.joinGroup);
router.put("/:groupId/requests/:requestId", authenticate, groupController.handleJoinRequest);

router.get("/:id/members", groupController.getGroupMembers);
router.put("/:groupId/members/:userId", authenticate, groupController.updateGroupMember);
router.delete("/:groupId/members/:userId", authenticate, groupController.removeGroupMember);

router.get("/:id/channels", groupController.getGroupChannels);
router.post("/:id/channels", authenticate, groupController.createChannel);
router.put("/:groupId/channels/:channelId", authenticate, groupController.updateChannel);
router.delete("/:groupId/channels/:channelId", authenticate, groupController.deleteChannel);

router.get("/:id", groupController.getGroupById);
router.put("/:id", authenticate, groupController.updateGroup);
router.delete("/:id", authenticate, groupController.deleteGroup);

export default router;