import { Request, Response, NextFunction } from "express";
import profileService from "../../business/services/profile.service";

const profileController = {

    // ─── Profile ──────────────────────────────────────────────────────────────

    async getMyProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = req.user!.userId;
            const profile = await profileService.getProfile(user_id);

            res.status(200).json(profile);
        } catch (error) {
            next(error);
        }
    },

    async getProfileById(req: Request, res: Response, next: NextFunction) {
        try {
            const targetUserId = Number(req.params.userId);

            const profile = await profileService.getProfile(targetUserId);

            // 🔒 visibility enforcement (important)
            if (profile.visibility === "PRIVATE") {
                return res.status(403).json({
                    message: "This profile is private",
                });
            }

            // optional: strip sensitive fields if needed
            const publicProfile = {
                user_id: profile.user_id,
                first_name: profile.first_name,
                last_name: profile.last_name,
                headline: profile.headline,
                bio: profile.bio,
                location: profile.location,
                website_url: profile.website_url,
                skills: profile.skills,
                education: profile.education,
                courses: profile.courses,
            };

            res.status(200).json(publicProfile);
        } catch (error) {
            next(error);
        }
    },

    async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = req.user!.userId;
            const updatedProfile = await profileService.updateProfile(user_id, req.body);

            res.status(200).json(updatedProfile);
        } catch (error) {
            next(error);
        }
    },

    // ─── Skills ───────────────────────────────────────────────────────────────

    async addSkill(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = req.user!.userId;
            const skill = await profileService.addSkill(user_id, req.body);

            res.status(201).json(skill);
        } catch (error) {
            next(error);
        }
    },

    async removeSkill(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = req.user!.userId;
            const skill_id = Number(req.params.skill_id);

            await profileService.removeSkill(user_id, skill_id);

            res.status(200).json({ message: "Skill removed successfully" });
        } catch (error) {
            next(error);
        }
    },

    // ─── Education ────────────────────────────────────────────────────────────

    async addEducation(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = req.user!.userId;
            const education = await profileService.addEducation(user_id, req.body);

            res.status(201).json(education);
        } catch (error) {
            next(error);
        }
    },

    async updateEducation(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = req.user!.userId;
            const education_id = Number(req.params.education_id);

            const updated = await profileService.updateEducation(user_id, education_id, req.body);

            res.status(200).json(updated);
        } catch (error) {
            next(error);
        }
    },

    async deleteEducation(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = req.user!.userId;
            const education_id = Number(req.params.education_id);

            await profileService.deleteEducation(user_id, education_id);

            res.status(200).json({ message: "Education deleted successfully" });
        } catch (error) {
            next(error);
        }
    },

    // ─── Courses ──────────────────────────────────────────────────────────────

    async getAllCourses(req: Request, res: Response, next: NextFunction) {
        try {
            const filters = {
                institution_id: req.query.institution_id ? Number(req.query.institution_id) : undefined,
                field_id: req.query.field_id ? Number(req.query.field_id) : undefined,
            };

            const courses = await profileService.getAllCourses(filters);

            res.status(200).json(courses);
        } catch (error) {
            next(error);
        }
    },

    async addCourse(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = req.user!.userId;
            const course = await profileService.addCourse(user_id, req.body);

            res.status(201).json(course);
        } catch (error) {
            next(error);
        }
    },

    async removeCourse(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = req.user!.userId;
            const course_id = Number(req.params.course_id);

            await profileService.removeCourse(user_id, course_id);

            res.status(200).json({ message: "Course removed successfully" });
        } catch (error) {
            next(error);
        }
    },

    // ─── Reference ────────────────────────────────────────────────────────────

    async getAllInstitutions(req: Request, res: Response, next: NextFunction) {
        try {
            const institutions = await profileService.getAllInstitutions();

            res.status(200).json(institutions);
        } catch (error) {
            next(error);
        }
    },

    async getAllFieldsOfStudy(req: Request, res: Response, next: NextFunction) {
        try {
            const fields = await profileService.getAllFieldsOfStudy();

            res.status(200).json(fields);
        } catch (error) {
            next(error);
        }
    },
};

export default profileController;