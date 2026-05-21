import { isAxiosError } from "axios";

import { api } from "@/lib/axios";
import type {
  ApiMessageResponse,
  CreateCommentRequest,
  CreatePostRequest,
  FeedApiErrorResponse,
  FeedCategory,
  FeedComment,
  FeedQuery,
  FeedResponse,
  PostRecord,
  ReactionRequest,
  ReactionResponse,
  SharePostRequest,
  UpdateCommentRequest,
  UpdatePostRequest,
} from "../types/feed.types";

function createFeedApiError(
  message: string,
  options?: {
    status?: number;
    errors?: FeedApiErrorResponse["errors"];
  }
) {
  return {
    name: "FeedApiError",
    message,
    status: options?.status,
    errors: options?.errors,
  };
}

function toFeedApiError(error: unknown) {
  if (isAxiosError<FeedApiErrorResponse>(error)) {
    return createFeedApiError(
      error.response?.data?.message ?? error.message ?? "Feed request failed",
      {
        status: error.response?.status,
        errors: error.response?.data?.errors,
      }
    );
  }

  if (error instanceof Error) {
    return createFeedApiError(error.message);
  }

  return createFeedApiError("Feed request failed");
}

function toQueryParams(query?: FeedQuery) {
  const params = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  return params;
}

async function requestFeed<T>(request: Promise<{ data: T }>) {
  try {
    const { data } = await request;
    return data;
  } catch (error) {
    throw toFeedApiError(error);
  }
}

function getFeed(query?: FeedQuery) {
  return requestFeed(
    api.get<FeedResponse>("/feed", {
      params: toQueryParams(query),
    })
  );
}

function createPost(payload: CreatePostRequest) {
  return requestFeed(api.post<PostRecord>("/posts", payload));
}

function getPostById(postId: number) {
  return requestFeed(api.get<PostRecord>(`/posts/${postId}`));
}

function updatePost(postId: number, payload: UpdatePostRequest) {
  return requestFeed(api.put<PostRecord>(`/posts/${postId}`, payload));
}

function deletePost(postId: number) {
  return requestFeed(api.delete<ApiMessageResponse>(`/posts/${postId}`));
}

function sharePost(postId: number, payload: SharePostRequest = {}) {
  return requestFeed(api.post<PostRecord>(`/posts/${postId}/share`, payload));
}

function createComment(postId: number, payload: CreateCommentRequest) {
  return requestFeed(api.post<FeedComment>(`/posts/${postId}/comments`, payload));
}

function getComments(postId: number) {
  return requestFeed(api.get<FeedComment[]>(`/posts/${postId}/comments`));
}

function updateComment(commentId: number, payload: UpdateCommentRequest) {
  return requestFeed(api.put<FeedComment>(`/comments/${commentId}`, payload));
}

function deleteComment(commentId: number) {
  return requestFeed(api.delete<ApiMessageResponse>(`/comments/${commentId}`));
}

function react(payload: ReactionRequest) {
  return requestFeed(api.post<ReactionResponse>("/reactions", payload));
}

function bookmarkPost(postId: number) {
  return requestFeed(api.post<unknown>(`/posts/${postId}/bookmark`));
}

function unbookmarkPost(postId: number) {
  return requestFeed(api.delete<ApiMessageResponse>(`/posts/${postId}/bookmark`));
}

function getCategories() {
  return requestFeed(api.get<FeedCategory[]>("/categories"));
}

export const feedApi = {
  getFeed,
  createPost,
  getPostById,
  updatePost,
  deletePost,
  sharePost,
  getComments,
  createComment,
  updateComment,
  deleteComment,
  react,
  bookmarkPost,
  unbookmarkPost,
  getCategories,
};
