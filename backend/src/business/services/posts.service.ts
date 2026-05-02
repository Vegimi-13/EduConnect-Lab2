import postRepository from "../../persistence/repositories/FeedRepositories/posts.repository";
import { CreatePostDtoType, UpdatePostDtoType } from "../dto/Feed/posts.dto";
import fileRepository from "../../persistence/repositories/FeedRepositories/file.repository";
const FILE_ENTITY = {
  POST: "post",
} as const;

const postService = {
  // ─── CREATE ─────────────────────────────
  async createPost(user_id: number, data: CreatePostDtoType) {
    if (data.post_type === "TEXT" && !data.content) {
      throw new Error("Content is required for TEXT posts");
    }
    const post = await postRepository.create(user_id, data);

    if (data.images?.length) {
      await Promise.all(
        data.images.map((url) =>
          fileRepository.create({
            entity: FILE_ENTITY.POST,
            entity_id: post.id,
            file_path: url,
            uploaded_by: user_id,
          }),
        ),
      );
    }

    return post;
  },

  async getPostById(postId: number) {
    const post = await postRepository.findActiveById(postId);

    if (!post) {
      throw new Error("Post not found");
    }
    const images = await fileRepository.findByEntity(FILE_ENTITY.POST, postId);

    return { ...post, images };
  },

  // ─── UPDATE ───────────────────────────
  async updatePost(user_id: number, postId: number, data: UpdatePostDtoType) {
    const post = await postRepository.findById(postId);

    if (!post || post.is_deleted) {
      throw new Error("Post not found");
    }

    if (post.user_id !== user_id) {
      throw new Error("Unauthorized");
    }

    return postRepository.update(postId, {
      ...data,
      is_edited: true,
      updated_at: new Date(),
    });
  },

  // ─── DELETE (SOFT) ─────────────────────
  async deletePost(user_id: number, postId: number) {
    const post = await postRepository.findById(postId);

    if (!post || post.is_deleted) {
      throw new Error("Post not found");
    }

    if (post.user_id !== user_id) {
      throw new Error("Unauthorized");
    }

    return postRepository.softDelete(postId);
  },

  //share post funksioni ketu
  async sharePost(user_id: number, postId: number, content?: string) {
    const original = await postRepository.findActiveById(postId);
    if (!original) {
      throw new Error("Post not found");
    }

    return postRepository.create(user_id, {
      content: content ?? null,
      visibility: "PUBLIC",
      post_type: "SHARE",
      share_of_post_id: postId,
    });
  },
};

export default postService;
