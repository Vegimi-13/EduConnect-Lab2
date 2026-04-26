import bookmarkRepository from "../../persistence/repositories/FeedRepositories/bookmark.repository";
import postRepository from "../../persistence/repositories/FeedRepositories/posts.repository";

const bookmarkService = {
  // ─── ADD BOOKMARK ─────────────────────
  async bookmarkPost(user_id: number, postId: number) {
    const post = await postRepository.findActiveById(postId);

    if (!post) {
      throw new Error("Post not found");
    }
    const existing = await bookmarkRepository.find(user_id, postId);

    if (existing) {

      return { message: "Already bookmarked" };
    }
    const created = await bookmarkRepository.create(user_id, postId);

    return created;
  },

  // ─── REMOVE BOOKMARK ───────────────────
  async unbookmarkPost(user_id: number, postId: number) {
    const existing = await bookmarkRepository.find(user_id, postId);

    if (!existing) {
      return { message: "Bookmark already removed" };
    }
    await bookmarkRepository.delete(user_id, postId);

    return { message: "Bookmark removed" };
  },
};

export default bookmarkService;