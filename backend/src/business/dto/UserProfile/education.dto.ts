import { z } from 'zod';

// ─── Base Schema (Single Source of Truth) ─────────────────────────────────────

const BaseEducationSchema = z.object({
    institution_id: z.number(),
    field_id: z.number(),
    degree: z.string().max(100),
    start_date: z.coerce.date(),
    end_date: z.coerce.date().optional().nullable(),
    description: z.string().max(500).optional().nullable(),
});

// ─── CreateEducationDto ───────────────────────────────────────────────────────────────

export const CreateEducationDto = BaseEducationSchema;
export type CreateEducationDtoType = z.infer<typeof CreateEducationDto>;

// ─── UpdateEducationDto ───────────────────────────────────────────────────────────────

export const UpdateEducationDto = BaseEducationSchema.partial();
export type UpdateEducationDtoType = z.infer<typeof UpdateEducationDto>;


// ─── EducationResponseDto ─────────────────────────────────────────────────────────────

export const EducationResponseDto = BaseEducationSchema.extend({
    id: z.number(),
    institution_name: z.string(),
});
export type EducationResponseDtoType = z.infer<typeof EducationResponseDto>;