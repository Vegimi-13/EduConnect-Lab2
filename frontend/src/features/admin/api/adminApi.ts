import { isAxiosError } from "axios";

import { api } from "@/lib/axios";
import type {
  AdminApiErrorResponse,
  AdminFeedResponse,
  AdminPermission,
  AdminRole,
  AdminUser,
  AdminAuditLogResponse,
  ReportsOverviewResponse,
} from "../types/admin.types";

function createAdminApiError(message: string, status?: number) {
  return {
    name: "AdminApiError",
    message,
    status,
  };
}

function toAdminApiError(error: unknown) {
  if (isAxiosError<AdminApiErrorResponse>(error)) {
    return createAdminApiError(
      error.response?.data?.message ?? error.message ?? "Admin request failed",
      error.response?.status
    );
  }

  if (error instanceof Error) {
    return createAdminApiError(error.message);
  }

  return createAdminApiError("Admin request failed");
}

async function requestAdmin<T>(request: Promise<{ data: T }>) {
  try {
    const { data } = await request;
    return data;
  } catch (error) {
    throw toAdminApiError(error);
  }
}

async function getOverview() {
  const result = await requestAdmin(
    api.get<ReportsOverviewResponse>("/reports/overview")
  );

  return result.data;
}

function getRoles() {
  return requestAdmin(api.get<AdminRole[]>("/roles"));
}

function getPermissions() {
  return requestAdmin(api.get<AdminPermission[]>("/roles/permissions"));
}

function searchUsers(q: string) {
  return requestAdmin(
    api.get<AdminUser[]>("/search/users", {
      params: {
        q,
        page: 1,
        limit: 8,
      },
    })
  );
}

function assignRole(userId: number, roleId: number) {
  return requestAdmin(api.post(`/roles/users/${userId}`, { role_id: roleId }));
}

function removeRole(userId: number, roleId: number) {
  return requestAdmin(api.delete(`/roles/users/${userId}/${roleId}`));
}

function assignPermission(roleId: number, permissionId: number) {
  return requestAdmin(
    api.post(`/roles/${roleId}/permissions`, { permission_id: permissionId })
  );
}

function removePermission(roleId: number, permissionId: number) {
  return requestAdmin(api.delete(`/roles/${roleId}/permissions/${permissionId}`));
}

function getRecentFeed() {
  return requestAdmin(
    api.get<AdminFeedResponse>("/feed", {
      params: {
        scope: "all",
        page: 1,
        limit: 5,
      },
    })
  );
}

function getAuditLogs(page: number = 1, limit: number = 10) {
  return requestAdmin(
    api.get<AdminAuditLogResponse>("/admin/audit-logs", {
      params: { page, limit },
    })
  );
}

function deleteUser(userId: number) {
  return requestAdmin(api.delete(`/admin/users/${userId}`));
}

function deletePost(postId: number) {
  return requestAdmin(api.delete(`/admin/posts/${postId}`));
}

export const adminApi = {
  getOverview,
  getRoles,
  getPermissions,
  searchUsers,
  assignRole,
  removeRole,
  assignPermission,
  removePermission,
  getRecentFeed,
  getAuditLogs,
  deleteUser,
  deletePost,
};
