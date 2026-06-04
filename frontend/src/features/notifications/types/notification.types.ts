export type NotificationType =
  | "FOLLOW_REQUEST"
  | "FOLLOW_ACCEPTED"
  | "POST_LIKE"
  | "POST_COMMENT"
  | "COMMENT_REPLY"
  | "MENTION"
  | "GROUP_INVITE"
  | "GROUP_POST"
  | "SYSTEM";

export type Notification = {
  id: number;
  recipient_id: number;
  sender_id: number | null;
  type: NotificationType;
  entity_type: string | null;
  entity_id: number | null;
  message: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile?: {
      headline: string | null;
      avatar_url?: string | null;
    } | null;
  } | null;
};

export type NotificationsResponse = {
  data: Notification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    unreadCount: number;
  };
};

export type MarkReadPayload = {
  notificationIds?: number[];
  all?: boolean;
};
