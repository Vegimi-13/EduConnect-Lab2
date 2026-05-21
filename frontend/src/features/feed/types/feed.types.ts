export type PostVisibility = "PUBLIC" | "PRIVATE" | "GROUP";
export type PostType = "TEXT" | "SHARE";
export type TargetType = "POST" | "COMMENT";
export type ReactionType = "LIKE" | "LOVE" | "HAHA";

export type FeedScope = "all" | "following" | "mine";

export type FeedQuery = {
  scope?: FeedScope;
  page?: number;
  limit?: number;
  authorId?: number;
  categoryId?: number;
  groupId?: number;
  postType?: PostType;
  visibility?: PostVisibility;
  search?: string;
};

export type FeedMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type FeedUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile?: {
    headline: string | null;
    location: string | null;
  } | null;
};

export type FeedGroup = {
  id: number;
  name: string;
  visibility: string | null;
};

export type FeedCategory = {
  id: number;
  name: string;
};

export type FeedImage = {
  id: number;
  entity: string;
  entity_id: number;
  filename?: string | null;
  file_path: string;
  file_size?: number | null;
  uploaded_by?: number | null;
  created_at?: string;
};

export type SharedPost = {
  id: number;
  user_id: number;
  content: string | null;
  visibility: PostVisibility | string;
  post_type: PostType | string;
  created_at: string;
  user?: Pick<FeedUser, "id" | "first_name" | "last_name" | "email">;
};

export type FeedPost = {
  id: number;
  user_id: number;
  group_id: number | null;
  content: string | null;
  visibility: PostVisibility | string;
  post_type: PostType | string;
  share_of_post_id: number | null;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string | null;
  user: FeedUser;
  group?: FeedGroup | null;
  shared_from?: SharedPost | null;
  categories: FeedCategory[];
  images: FeedImage[];
  stats: {
    comments: number;
    reactions: number;
  };
  viewer: {
    isBookmarked: boolean;
    myReaction: ReactionType | string | null;
  };
};

export type PostRecord = {
  id: number;
  user_id: number;
  group_id: number | null;
  content: string | null;
  visibility: PostVisibility | string;
  post_type: PostType | string;
  share_of_post_id: number | null;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string | null;
  images?: FeedImage[];
};

export type FeedResponse = {
  data: FeedPost[];
  meta: FeedMeta;
};

export type CreatePostRequest = {
  content?: string;
  visibility: PostVisibility;
  post_type: PostType;
  share_of_post_id?: number;
  images?: string[];
  group_id?: number;
};

export type UpdatePostRequest = {
  content?: string;
  visibility?: PostVisibility;
};

export type SharePostRequest = {
  content?: string;
};

export type CreateCommentRequest = {
  content: string;
  parent_comment_id?: number;
};

export type UpdateCommentRequest = {
  content: string;
};

export type FeedComment = {
  id: number;
  post_id: number;
  user_id: number;
  parent_comment_id: number | null;
  content: string;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string | null;
  user?: Pick<FeedUser, "id" | "first_name" | "last_name" | "email">;
};

export type ReactionRequest = {
  target_type: TargetType;
  target_id: number;
  reaction_type: ReactionType;
};

export type ReactionResponse = {
  action: "CREATED" | "UPDATED" | "REMOVED";
  data: unknown | null;
};

export type ApiMessageResponse = {
  message: string;
};

export type FeedApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};
