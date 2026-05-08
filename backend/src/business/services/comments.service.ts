import commentRepository from "../../persistence/repositories/FeedRepositories/comments.repository";
import postRepository from "../../persistence/repositories/FeedRepositories/posts.repository";
import userRepository from "../../persistence/repositories/user.repository";
import notificationService from "./notification.service";
import {
  CreateCommentDtoType,
  UpdateCommentDtoType,
} from "../dto/Feed/comments.dto";

const commentService = {
  // ─── CREATE COMMENT ─────────────────────
  async createComment(
    user_id: number,
    postId: number,
    data: CreateCommentDtoType
  ) {
    //  1. Check post exists
    const post = await postRepository.findActiveById(postId);

    if (!post) {
      throw new Error("Post not found");
    }

    //  2. If reply → validate parent
    if (data.parent_comment_id !== undefined) {
      const parent = await commentRepository.findById(
        data.parent_comment_id
      );

      if (!parent || parent.is_deleted) {
        throw new Error("Parent comment not found");
      }

      // 🔥 IMPORTANT: ensure same post
      if (parent.post_id !== postId) {
        throw new Error("Invalid parent comment (different post)");
      }
    }

    const comment = await commentRepository.create(user_id, postId, data);

    if (post.user_id !== user_id) {
      const commenter = await userRepository.findById(user_id);
      const actorName = commenter
        ? `${commenter.first_name} ${commenter.last_name}`
        : "Someone";

      await notificationService.notify({
        user_id: post.user_id,
        type: "POST_COMMENT",
        title: "New comment",
        message: `${actorName} commented: ${preview(data.content)}`,
      });
    }

    return comment;
  },

  // ─── UPDATE COMMENT ─────────────────────
  async updateComment(
    user_id: number,
    commentId: number,
    data: UpdateCommentDtoType
  ) {
    const comment = await commentRepository.findById(commentId);

    if (!comment || comment.is_deleted) {
      throw new Error("Comment not found");
    }

    // 🔥 Ownership check
    if (comment.user_id !== user_id) {
      throw new Error("Unauthorized");
    }

    return commentRepository.update(commentId, {
      content: data.content,
      is_edited: true,
      updated_at: new Date(),
    });
  },

  // ─── DELETE COMMENT (SOFT) ──────────────
  async deleteComment(user_id: number, commentId: number) {
    const comment = await commentRepository.findById(commentId);

    if (!comment || comment.is_deleted) {
      throw new Error("Comment not found");
    }

    // 🔥 Ownership check
    if (comment.user_id !== user_id) {
      throw new Error("Unauthorized");
    }

    return commentRepository.softDelete(commentId);
  },
};

function preview(value: string, maxLength = 90) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

export default commentService;
