import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { postController } from "../../controllers/FeedController/posts.controller";

const router = Router();

router.get("/", authenticate, postController.getFeed);

export default router;
