import { Router } from "express";

import categoryController from "../../controllers/FeedController/categories.controller";

const router = Router();

router.get("/", categoryController.getAllCategories);

export default router;