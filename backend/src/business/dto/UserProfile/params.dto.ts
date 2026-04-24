import { z } from 'zod';

export const IdParamDto = z.object({
    id: z.coerce.number(),
});

export const UserIdParamDto = z.object({
    userId: z.string(),
});

export const SkillIdParamDto = z.object({
    skillId: z.coerce.number(),
});

export const CourseIdParamDto = z.object({
    courseId: z.coerce.number(),
});

export type IdParamDtoType = z.infer<typeof IdParamDto>;
export type UserIdParamDtoType = z.infer<typeof UserIdParamDto>;
export type SkillIdParamDtoType = z.infer<typeof SkillIdParamDto>;
export type CourseIdParamDtoType = z.infer<typeof CourseIdParamDto>;