import { z } from "zod";

// ─── CREATE COMMENT ─────────────────────────────

export const CreateCommentDto = z.object({
  content: z.string().min(1, "Content is required").max(1000),

  parent_comment_id: z
    .number()
    .int()
    .positive()
    .optional(),
});

// ─── UPDATE COMMENT ─────────────────────────────

export const UpdateCommentDto = z.object({
  content: z.string().min(1, "Content is required").max(1000),
});

// ─── PARAMS ─────────────────────────────────────

// for /comments/:id

export const CommentIdParamDto = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

// for /posts/:id/comments

export const PostIdParamDto = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

// ─── TYPES ─────────────────────────────────────

export type CreateCommentDtoType = z.infer<typeof CreateCommentDto>;

export type UpdateCommentDtoType = z.infer<typeof UpdateCommentDto>;
