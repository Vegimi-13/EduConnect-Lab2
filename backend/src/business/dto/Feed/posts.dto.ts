import { z } from "zod";
import { POST_VISIBILITY, POST_TYPES } from "../../../shared/constants/enum";


export const CreatePostDto = z.object({
  content:z.string().max(1000).optional(),
  visibility: z.enum(POST_VISIBILITY),
  post_type: z.enum(POST_TYPES),
  share_of_post_id: z.number().int().positive().optional(),
  images: z.array(z.string().url()).max(5).optional(),
  group_id: z.number().int().positive().optional(),
}).refine(
  (data) => {
    if(data.post_type === "TEXT"){
      return !!data.content;
    }
    if(data.post_type === "SHARE"){
      return !!data.share_of_post_id;
    }
    return true;
  },
  {
    message:"Invalid post data based on post type"
  }
).refine(
  (data) => {
    if (data.visibility === "GROUP") {
      return !!data.group_id;
    }

    return data.group_id === undefined;
  },
  {
    message: "group_id is required only for GROUP visibility",
    path: ["group_id"],
  }
);

export const UpdatePostDto = z.object({
  content: z.string().max(1000).optional(),
  visibility: z.enum(POST_VISIBILITY).optional()
})


export const PostIdParamDto = z.object({
  id: z.string().transform((val) => Number(val)),

});

export const FeedQueryDto = z.object({
  scope: z.enum(["all", "following", "mine"]).default("all"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  authorId: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  groupId: z.coerce.number().int().positive().optional(),
  postType: z.enum(POST_TYPES).optional(),
  visibility: z.enum(POST_VISIBILITY).optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

export type CreatePostDtoType = z.infer<typeof CreatePostDto>;
export type UpdatePostDtoType = z.infer<typeof UpdatePostDto>;
export type FeedQueryDtoType = z.infer<typeof FeedQueryDto>;
