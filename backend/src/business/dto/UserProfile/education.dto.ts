import { z } from 'zod';

// Base schema aligned with DB
const BaseEducationSchema = z.object({
    institution_id: z.number(),
    field_id: z.number(),
    degree: z.string().max(100),
    start_year: z.number(),
    end_year: z.number().nullable().optional(),
    description: z.string().max(500).nullable().optional(),
});

// Create
export const CreateEducationDto = BaseEducationSchema;

// Update
export const UpdateEducationDto = BaseEducationSchema.partial();

// Response (joined data)
export const EducationResponseDto = BaseEducationSchema.extend({
    id: z.number(),
    institution_name: z.string(),
    field_name: z.string(),
});

// List
export const EducationListResponseDto = z.array(EducationResponseDto);

export type CreateEducationDtoType = z.infer<typeof CreateEducationDto>;
export type UpdateEducationDtoType = z.infer<typeof UpdateEducationDto>;
export type EducationResponseDtoType = z.infer<typeof EducationResponseDto>;