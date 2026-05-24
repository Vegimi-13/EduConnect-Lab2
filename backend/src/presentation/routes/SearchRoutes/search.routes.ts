import { Router } from "express";
import searchController from "../../controllers/SearchController/search.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();
router.get("/users", authenticate, searchController.searchUsers);
router.get("/groups", authenticate, searchController.searchGroups);
router.get("/institutions", authenticate, searchController.searchInstitutions);


export default router;
