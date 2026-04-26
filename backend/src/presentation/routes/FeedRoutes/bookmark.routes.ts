import { Router } from "express";
import bookmarkController from "../../controllers/FeedController/bookmark.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { validateParams } from "../../middleware/validateParams.middleware";
import { PostIdParamDto } from "../../../business/dto/Feed/posts.dto";

const router = Router();

router.post(
  "/:id/bookmark",
  authenticate,
  validateParams(PostIdParamDto),
  bookmarkController.bookmarkPost
);

router.delete(
  "/:id/bookmark",
  authenticate,
  validateParams(PostIdParamDto),
  bookmarkController.unbookmarkPost
);

export default router;