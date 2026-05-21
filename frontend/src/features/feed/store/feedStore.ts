import { create } from "zustand";

import { feedApi } from "../api/feedApi";
import type {
  CreateCommentRequest,
  CreatePostRequest,
  FeedCategory,
  FeedComment,
  FeedMeta,
  FeedPost,
  FeedQuery,
  PostRecord,
  ReactionRequest,
  SharePostRequest,
  UpdatePostRequest,
} from "../types/feed.types";

type FeedStatus = "idle" | "loading" | "success" | "error";

type FeedState = {
  posts: FeedPost[];
  categories: FeedCategory[];
  commentsByPost: Record<number, FeedComment[]>;
  commentsLoadingByPost: Record<number, boolean>;
  meta: FeedMeta | null;
  query: FeedQuery;
  status: FeedStatus;
  error: string | null;
  setQuery: (query: FeedQuery) => void;
  fetchFeed: (query?: FeedQuery) => Promise<void>;
  fetchNextPage: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchComments: (postId: number) => Promise<void>;
  createPost: (payload: CreatePostRequest) => Promise<PostRecord>;
  updatePost: (postId: number, payload: UpdatePostRequest) => Promise<PostRecord>;
  deletePost: (postId: number) => Promise<void>;
  sharePost: (postId: number, payload?: SharePostRequest) => Promise<PostRecord>;
  createComment: (
    postId: number,
    payload: CreateCommentRequest
  ) => Promise<void>;
  reactToPost: (postId: number, reactionType?: ReactionRequest["reaction_type"]) => Promise<void>;
  toggleBookmark: (postId: number) => Promise<void>;
  clearFeed: () => void;
};

const defaultQuery: FeedQuery = {
  scope: "all",
  page: 1,
  limit: 20,
};

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  return "Something went wrong";
}

function updatePostById(
  posts: FeedPost[],
  postId: number,
  updater: (post: FeedPost) => FeedPost
) {
  return posts.map((post) => (post.id === postId ? updater(post) : post));
}

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [],
  categories: [],
  commentsByPost: {},
  commentsLoadingByPost: {},
  meta: null,
  query: defaultQuery,
  status: "idle",
  error: null,

  setQuery: (query) =>
    set((state) => ({
      query: {
        ...state.query,
        ...query,
      },
    })),

  fetchFeed: async (query) => {
    const nextQuery = {
      ...get().query,
      ...query,
    };

    set({
      status: "loading",
      error: null,
      query: nextQuery,
    });

    try {
      const feed = await feedApi.getFeed(nextQuery);

      set({
        posts: feed.data,
        meta: feed.meta,
        status: "success",
      });
    } catch (error) {
      set({
        status: "error",
        error: getErrorMessage(error),
      });
    }
  },

  fetchNextPage: async () => {
    const { meta, query, posts } = get();

    if (!meta?.hasNextPage) {
      return;
    }

    set({ status: "loading", error: null });

    try {
      const feed = await feedApi.getFeed({
        ...query,
        page: meta.page + 1,
      });

      set({
        posts: [...posts, ...feed.data],
        meta: feed.meta,
        query: {
          ...query,
          page: feed.meta.page,
        },
        status: "success",
      });
    } catch (error) {
      set({
        status: "error",
        error: getErrorMessage(error),
      });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await feedApi.getCategories();
      set({ categories });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    }
  },

  fetchComments: async (postId) => {
    set((state) => ({
      commentsLoadingByPost: {
        ...state.commentsLoadingByPost,
        [postId]: true,
      },
      error: null,
    }));

    try {
      const comments = await feedApi.getComments(postId);

      set((state) => ({
        commentsByPost: {
          ...state.commentsByPost,
          [postId]: comments,
        },
        commentsLoadingByPost: {
          ...state.commentsLoadingByPost,
          [postId]: false,
        },
      }));
    } catch (error) {
      set((state) => ({
        error: getErrorMessage(error),
        commentsLoadingByPost: {
          ...state.commentsLoadingByPost,
          [postId]: false,
        },
      }));
    }
  },

  createPost: async (payload) => {
    const post = await feedApi.createPost(payload);
    await get().fetchFeed({ ...get().query, page: 1 });

    return post;
  },

  updatePost: async (postId, payload) => {
    const post = await feedApi.updatePost(postId, payload);
    await get().fetchFeed(get().query);

    return post;
  },

  deletePost: async (postId) => {
    await feedApi.deletePost(postId);

    set((state) => ({
      posts: state.posts.filter((post) => post.id !== postId),
    }));
  },

  sharePost: async (postId, payload = {}) => {
    const post = await feedApi.sharePost(postId, payload);
    await get().fetchFeed({ ...get().query, page: 1 });

    return post;
  },

  createComment: async (postId, payload) => {
    const comment = await feedApi.createComment(postId, payload);

    set((state) => ({
      commentsByPost: {
        ...state.commentsByPost,
        [postId]: [...(state.commentsByPost[postId] ?? []), comment],
      },
      posts: updatePostById(state.posts, postId, (post) => ({
        ...post,
        stats: {
          ...post.stats,
          comments: post.stats.comments + 1,
        },
      })),
    }));
  },

  reactToPost: async (postId, reactionType = "LIKE") => {
    const post = get().posts.find((item) => item.id === postId);
    const previousReaction = post?.viewer.myReaction ?? null;
    const result = await feedApi.react({
      target_type: "POST",
      target_id: postId,
      reaction_type: reactionType,
    });

    set((state) => ({
      posts: updatePostById(state.posts, postId, (item) => {
        const removed = result.action === "REMOVED";
        const hadReaction = Boolean(previousReaction);
        const nextReaction = removed ? null : reactionType;
        const reactionDelta = removed ? -1 : hadReaction ? 0 : 1;

        return {
          ...item,
          stats: {
            ...item.stats,
            reactions: Math.max(0, item.stats.reactions + reactionDelta),
          },
          viewer: {
            ...item.viewer,
            myReaction: nextReaction,
          },
        };
      }),
    }));
  },

  toggleBookmark: async (postId) => {
    const post = get().posts.find((item) => item.id === postId);

    if (!post) {
      return;
    }

    if (post.viewer.isBookmarked) {
      await feedApi.unbookmarkPost(postId);
    } else {
      await feedApi.bookmarkPost(postId);
    }

    set((state) => ({
      posts: updatePostById(state.posts, postId, (item) => ({
        ...item,
        viewer: {
          ...item.viewer,
          isBookmarked: !item.viewer.isBookmarked,
        },
      })),
    }));
  },

  clearFeed: () =>
    set({
      posts: [],
      commentsByPost: {},
      commentsLoadingByPost: {},
      meta: null,
      query: defaultQuery,
      status: "idle",
      error: null,
    }),
}));
