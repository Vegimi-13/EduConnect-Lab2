import { z } from 'zod';

// Add skill to user - can either provide skill_id (existing) or name (new skill)
export const AddUserSkillDto = z.object({
    skill_id: z.number().optional(),
    name: z.string().min(1).optional(),
}).refine(data => data.skill_id || data.name, {
    message: "Either skill_id or name must be provided",
});

// Single skill response
export const SkillDto = z.object({
    id: z.number(),
    name: z.string(),
});

// List response
export const UserSkillListResponseDto = z.array(SkillDto);

export type AddUserSkillDtoType = z.infer<typeof AddUserSkillDto>;
export type SkillDtoType = z.infer<typeof SkillDto>;