import { Router } from "express";
import reactionController from "../controllers/reaction.controller";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import { ReactionCreateDto } from "../../business/dto/Feed/reactions.dto";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(ReactionCreateDto),
  reactionController.addReaction,
);

export default router;
