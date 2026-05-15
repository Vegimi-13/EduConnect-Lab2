import { Router } from "express";
import searchController from "../../controllers/SearchController/search.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();
router.get("/users", authenticate, searchController.searchUsers);

export default router;
