import { Router } from "express";
import commentController from "../../controllers/FeedController/comments.controller";

import { authenticate } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { validateParams } from "../../middleware/validateParams.middleware";

import {
  CreateCommentDto,
  UpdateCommentDto,
  CommentIdParamDto,
  PostIdParamDto,
} from "../../../business/dto/Feed/comments.dto";

const router = Router();

// POST /api/posts/:id/comments
router.post(
  "/posts/:id/comments",
  authenticate,
  validateParams(PostIdParamDto),
  validate(CreateCommentDto),
  commentController.createComment
);

// PUT /api/comments/:id
router.put(
  "/comments/:id",
  authenticate,
  validateParams(CommentIdParamDto),
  validate(UpdateCommentDto),
  commentController.updateComment
);

// DELETE /api/comments/:id
router.delete(
  "/comments/:id",
  authenticate,
  validateParams(CommentIdParamDto),
  commentController.deleteComment
);

export default router;