import { z } from "zod";
import { TARGET_TYPES, REACTION_TYPES } from "../../../shared/constants/enum";



export const ReactionCreateDto = z.object({
  target_type: z.enum(TARGET_TYPES),
  target_id: z.number().int().positive(),
  reaction_type: z.enum(REACTION_TYPES),
});

export type ReactionCreateDtoType = z.infer<typeof ReactionCreateDto>;
