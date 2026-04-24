import { z } from 'zod';

// Add course
export const AddUserCourseDto = z.object({
    course_id: z.number(),
    semester: z.string().nullable(),
    year: z.number().nullable(),
});

// Query filters
export const GetCoursesQueryDto = z.object({
    institution_id: z.coerce.number().optional(),
    field_id: z.coerce.number().optional(),
});

// Response
export const UserCourseResponseDto = z.object({
    course_id: z.number(),
    code: z.string(),
    name: z.string(),
    institution_name: z.string(),
    field_name: z.string(),
    semester: z.string().nullable().optional(),
    year: z.number().nullable().optional(),
});

// List
export const UserCourseListResponseDto = z.array(UserCourseResponseDto);

export type AddUserCourseDtoType = z.infer<typeof AddUserCourseDto>;
export type UserCourseResponseDtoType = z.infer<typeof UserCourseResponseDto>;