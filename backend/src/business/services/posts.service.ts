import postRepository from "../../persistence/repositories/FeedRepositories/posts.repository";
import {
  CreatePostDtoType,
  FeedQueryDtoType,
  UpdatePostDtoType,
} from "../dto/Feed/posts.dto";
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

    if (data.visibility === "GROUP") {
      if (!data.group_id) {
        throw new Error("group_id is required for GROUP posts");
      }

      const group = await postRepository.findGroupById(data.group_id);
      if (!group) {
        throw new Error("Group not found");
      }

      const membership = await postRepository.findActiveGroupMembership(
        data.group_id,
        user_id,
      );

      if (!membership) {
        throw new Error("You must be an active group member to post in this group");
      }
    }

    const post = await postRepository.create(user_id, data);

    if (!data.images?.length) {
      return { ...post, images: [] };
    }

    const images = await fileRepository.createMany(
      data.images.map((image) => ({
        entity: FILE_ENTITY.POST,
        entity_id: post.id,
        file_path: image,
        uploaded_by: user_id,
      })),
    );

    return { ...post, images };
  },

  // ─── GET ───────────────────────────────
  async getPostById(postId: number) {
    const post = await postRepository.findActiveById(postId);

    if (!post) {
      throw new Error("Post not found");
    }
    const images = await fileRepository.findByEntity(FILE_ENTITY.POST, postId);

    return { ...post, images };
  },

  async getFeed(user_id: number, query: FeedQueryDtoType) {
    const followingIds = await postRepository.findAcceptedFollowingIds(user_id);

    if (query.scope === "following" && followingIds.length === 0) {
      return {
        data: [],
        meta: {
          page: query.page,
          limit: query.limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: query.page > 1,
        },
      };
    }

    const feed = await postRepository.findFeed({
      ...query,
      viewerId: user_id,
      followingIds,
    });

    const postIds = feed.data.map((post: { id: number }) => post.id);
    const images = await fileRepository.findByEntities(FILE_ENTITY.POST, postIds);
    const imagesByPost = new Map<number, typeof images>();

    for (const image of images) {
      const existing = imagesByPost.get(image.entity_id) ?? [];
      existing.push(image);
      imagesByPost.set(image.entity_id, existing);
    }

    return {
      ...feed,
      data: feed.data.map((post: { id: number }) => ({
        ...post,
        images: imagesByPost.get(post.id) ?? [],
      })),
    };
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
