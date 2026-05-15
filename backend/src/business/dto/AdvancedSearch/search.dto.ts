import { z } from "zod";

export const SearchUsersQueryDto = z.object({
  q: z.string().min(1),

  page: z
    .string()
    .optional()
    .transform((val) => Number(val) || 1),
  limit: z
    .string()
    .optional()
    .transform((val) => Number(val) || 10),
});

export type SearchUsersQueryDtoType = z.infer<typeof SearchUsersQueryDto>;
