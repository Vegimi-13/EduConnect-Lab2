import { z } from "zod";
import { POST_VISIBILITY, POST_TYPES } from "../../../shared/constants/enum";


export const CreatePostDto = z.object({
  content:z.string().max(1000).optional(),
  visibility: z.enum(POST_VISIBILITY),
  post_type: z.enum(POST_TYPES),
  share_of_post_id: z.number().int().positive().optional(),
  images: z.array(z.string().url()).max(5).optional(),
}).refine(
  (data) => {
    if(data.post_type === "TEXT"){
      return !!data.content;
    }
    if(data.post_type === "SHARE"){
      return !!data.share_of_post_id;
    }
     if (data.post_type === "IMAGE") {
        return !!data.images && data.images.length > 0;
      }
    return true;
  },
  {
    message:"Invalid post data based on post type"
  }
  
);

export const UpdatePostDto = z.object({
  content: z.string().max(1000).optional(),
  visibility: z.enum(POST_VISIBILITY).optional()
})


export const PostIdParamDto = z.object({
  id: z.string().transform((val) => Number(val)),

});


export type CreatePostDtoType = z.infer<typeof CreatePostDto>;
export type UpdatePostDtoType = z.infer<typeof UpdatePostDto>;