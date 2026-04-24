import { z } from 'zod';

// Add skill to user
export const AddUserSkillDto = z.object({
    skill_id: z.number(),
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