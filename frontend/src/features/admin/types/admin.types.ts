import type { FeedPost } from "@/features/feed/types/feed.types";

export type ReportsOverview = {
  users: number;
  posts: number;
  reactions: number;
  groups: number;
  messages: number;
  follows: number;
  courses: number;
};

export type ReportsOverviewResponse = {
  success: boolean;
  data: ReportsOverview;
};

export type AdminPermission = {
  id: number;
  name: string;
  description: string | null;
};

export type AdminRolePermission = {
  id: number;
  role_id: number;
  permission_id: number;
  permission: AdminPermission;
};

export type AdminRole = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  role_permissions: AdminRolePermission[];
};

export type AdminUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active?: boolean;
};

export type AdminAuditLog = {
  id: number;
  user_id: number | null;
  action: string;
  entity: string;
  entity_id: number;
  old_value: string | null;
  new_value: string | null;
  ip_address: string | null;
  created_at: string;
  user: AdminUser | null;
};

export type AdminAuditLogResponse = {
  data: AdminAuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AdminFeedResponse = {
  data: FeedPost[];
};

export type AdminApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};
