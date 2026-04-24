import { Router } from "express";
import profileController from "../controllers/profile.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// ─── Profile ──────────────────────────────────────────────────────────────

router.get("/me", authenticate, profileController.getMyProfile);
router.get("/:userId", authenticate, profileController.getProfileById);
router.put("/me", authenticate, profileController.updateProfile);

// ─── Skills ───────────────────────────────────────────────────────────────

router.post("/skills", authenticate, profileController.addSkill);
router.delete("/skills/:skill_id", authenticate, profileController.removeSkill);

// ─── Education ────────────────────────────────────────────────────────────

router.post("/education", authenticate, profileController.addEducation);
router.put("/education/:education_id", authenticate, profileController.updateEducation);
router.delete("/education/:education_id", authenticate, profileController.deleteEducation);

// ─── Courses ──────────────────────────────────────────────────────────────

router.get("/courses", profileController.getAllCourses);

router.post("/courses", authenticate, profileController.addCourse);
router.delete("/courses/:course_id", authenticate, profileController.removeCourse);

// ─── Reference Data ───────────────────────────────────────────────────────

router.get("/institutions", profileController.getAllInstitutions);
router.get("/fields", profileController.getAllFieldsOfStudy);

export default router;