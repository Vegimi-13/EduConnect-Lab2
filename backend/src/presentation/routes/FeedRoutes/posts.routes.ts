import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { validateParams } from "../../middleware/validateParams.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import { postController } from "../../controllers/FeedController/posts.controller";
import {
  CreatePostDto,
  UpdatePostDto,
  PostIdParamDto,
} from "../../../business/dto/Feed/posts.dto";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(CreatePostDto),
  postController.createPost,
);

router.get("/:id", validateParams(PostIdParamDto), postController.getPostById);

router.put(
  "/:id",
  authenticate,
  validateParams(PostIdParamDto),
  validate(UpdatePostDto),
  postController.updatePost,
);

router.delete(
  "/:id",
  authenticate,
  validateParams(PostIdParamDto),
  postController.deletePost,
);

export default router;
