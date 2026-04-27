import { z } from "zod";

export const SharePostDto = z.object({
  content: z.string().max(500).optional(),
});

export type SharePostDtoType = z.infer<typeof SharePostDto>;
