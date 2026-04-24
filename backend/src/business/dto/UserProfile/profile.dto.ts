import { z } from 'zod';

import { SkillDto } from '../UserProfile/skills.dto';
import { EducationResponseDto } from '../UserProfile/education.dto';
import { UserCourseResponseDto } from '../UserProfile/courses.dto';

// ─── Update Profile ──────────────────────────────────────────────────────────

export const UserProfileUpdateDto = z.object({
    headline: z.string().max(150).optional(),
    bio: z.string().max(500).optional(),
    location: z.string().max(100).optional(),
    website_url: z.string().optional(),
    visibility: z.enum(['public', 'private']).optional(),
});

export type UserProfileUpdateDtoType = z.infer<typeof UserProfileUpdateDto>;


// ─── Base User + Profile ─────────────────────────────────────────────────────

export const UserProfileBaseDto = z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.string(),

    headline: z.string().nullable().optional(),
    bio: z.string().max(500).nullable().optional(),
    location: z.string().max(100).nullable().optional(),
    website_url: z.string().nullable().optional(),
    visibility: z.enum(['public', 'private']),

    created_at: z.string(),
});

export type UserProfileBaseDtoType = z.infer<typeof UserProfileBaseDto>;


// ─── Full Profile (Aggregated) ───────────────────────────────────────────────

export const FullProfileResponseDto = z.object({
    user: UserProfileBaseDto,

    skills: z.array(SkillDto),

    education: z.array(EducationResponseDto),

    courses: z.array(UserCourseResponseDto),
});

export type FullProfileResponseDtoType = z.infer<typeof FullProfileResponseDto>;