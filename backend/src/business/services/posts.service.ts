import postRepository from "../../persistence/repositories/FeedRepositories/posts.repository";
import { CreatePostDtoType, UpdatePostDtoType } from "../dto/Feed/posts.dto";

const postService = {
  // ─── CREATE ─────────────────────────────
  async createPost(user_id: number, data: CreatePostDtoType) {
    // 🔥 SHARE logic
    if (data.post_type === "SHARE") {
      const original = await postRepository.findActiveById(
        data.share_of_post_id!
      );

      if (!original) {
        throw new Error("Original post not found");
      }
    }

    // 🔥 TEXT validation
    if (data.post_type === "TEXT" && !data.content) {
      throw new Error("Content is required for TEXT posts");
    }

    return postRepository.create(user_id, data);
  },

  // ─── GET ───────────────────────────────
  async getPostById(postId: number) {
    const post = await postRepository.findActiveById(postId);

    if (!post) {
      throw new Error("Post not found");
    }

    return post;
  },

  // ─── UPDATE ───────────────────────────
  async updatePost(
    user_id: number,
    postId: number,
    data: UpdatePostDtoType
  ) {
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
};

export default postService;