import profileRepository from "../../persistence/repositories/profile.repository";
import skillsRepository from "../../persistence/repositories/skills.repository";
import educationRepository from "../../persistence/repositories/education.repository";
import courseRepository from "../../persistence/repositories/courses.repository";
import referenceRepository from "../../persistence/repositories/references.repository";
import userRepository from "../../persistence/repositories/user.repository";

import { UserProfileUpdateDtoType } from "../../business/dto/UserProfile/profile.dto";
import { AddUserSkillDtoType } from "../../business/dto/UserProfile/skills.dto";
import { CreateEducationDtoType, UpdateEducationDtoType } from "../../business/dto/UserProfile/education.dto";
import { AddUserCourseDtoType } from "../../business/dto/UserProfile/courses.dto";

const profileService = {

    // ─── Profile ──────────────────────────────────────────────────────────────

    async getProfile(user_id: number) {
        const [user, profile] = await Promise.all([
            userRepository.findById(user_id),
            profileRepository.findProfileByUserId(user_id),
        ]);

        if (!user) throw new Error('User not found');
        if (!profile) throw new Error('Profile not found');

        const [skills, education, courses] = await Promise.all([
            skillsRepository.findByUserId(user_id),
            educationRepository.findByUserId(user_id),
            courseRepository.findByUserId(user_id),
        ]);

        return {
            user_id:     user.id,
            first_name:  user.first_name,
            last_name:   user.last_name,
            email:       user.email,
            headline:    profile.headline,
            bio:         profile.bio,
            location:    profile.location,
            website_url: profile.website_url,
            visibility:  profile.visibility,
            skills,
            education,
            courses,
        };
    },

    async updateProfile(user_id: number, data: UserProfileUpdateDtoType) {
        const profile = await profileRepository.findProfileByUserId(user_id);
        if (!profile) throw new Error('Profile not found');

        return await profileRepository.updateProfile(user_id, data);
    },

    // ─── Skills ───────────────────────────────────────────────────────────────

    async addSkill(user_id: number, data: AddUserSkillDtoType) {
        const alreadyAdded = await skillsRepository.userHasSkill(user_id, data.skill_id);
        if (alreadyAdded) throw new Error('Skill already added to profile');

        return await skillsRepository.addSkillToUser(user_id, data.skill_id);
    },

    async removeSkill(user_id: number, skill_id: number) {
        const exists = await skillsRepository.userHasSkill(user_id, skill_id);
        if (!exists) throw new Error('Skill not found on profile');

        return await skillsRepository.removeSkillFromUser(user_id, skill_id);
    },

    // ─── Education ────────────────────────────────────────────────────────────

    async addEducation(user_id: number, data: CreateEducationDtoType) {
        const institution = await referenceRepository.findInstitutionById(data.institution_id);
        if (!institution) throw new Error('Institution not found');

        if (data.field_id) {
            const field = await referenceRepository.findFieldOfStudyById(data.field_id);
            if (!field) throw new Error('Field of study not found');
        }

        return await educationRepository.create(user_id, data);
    },

    async updateEducation(user_id: number, education_id: number, data: UpdateEducationDtoType) {
        const isOwner = await educationRepository.isEducationOwnerByUser(education_id, user_id);
        if (!isOwner) throw new Error('Education entry not found');

        if (data.institution_id) {
            const institution = await referenceRepository.findInstitutionById(data.institution_id);
            if (!institution) throw new Error('Institution not found');
        }

        if (data.field_id) {
            const field = await referenceRepository.findFieldOfStudyById(data.field_id);
            if (!field) throw new Error('Field of study not found');
        }

        return await educationRepository.update(education_id, data);
    },

    async deleteEducation(user_id: number, education_id: number) {
        const isOwner = await educationRepository.isEducationOwnerByUser(education_id, user_id);
        if (!isOwner) throw new Error('Education entry not found');

        return await educationRepository.delete(education_id);
    },

    // ─── Courses ──────────────────────────────────────────────────────────────

    async getAllCourses(filters: { institution_id?: number; field_id?: number } = {}) {
        return await courseRepository.findAllCourses(filters);
    },

    async addCourse(user_id: number, data: AddUserCourseDtoType) {
        const course = await courseRepository.findById(data.course_id);
        if (!course) throw new Error('Course not found');

        const alreadyAdded = await courseRepository.userHasCourse(user_id, data.course_id);
        if (alreadyAdded) throw new Error('Course already added to profile');

        return await courseRepository.create(user_id, data);
    },

    async removeCourse(user_id: number, course_id: number) {
        const exists = await courseRepository.userHasCourse(user_id, course_id);
        if (!exists) throw new Error('Course not found on profile');

        return await courseRepository.delete(user_id, course_id);
    },

    // ─── Reference ────────────────────────────────────────────────────────────

    async getAllInstitutions() {
        return await referenceRepository.findAllInstitutions();
    },

    async getAllFieldsOfStudy() {
        return await referenceRepository.findAllFieldsOfStudy();
    },

};

export default profileService;