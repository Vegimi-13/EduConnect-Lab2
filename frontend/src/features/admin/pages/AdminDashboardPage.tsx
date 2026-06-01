import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/AppShell";
import { adminApi } from "../api/adminApi";
import { AdminAccessNotice } from "../components/AdminAccessNotice";
import { AdminHero } from "../components/AdminHero";
import { AdminMetricGrid } from "../components/AdminMetricGrid";
import { AdminRecentActivity } from "../components/AdminRecentActivity";
import { AdminRolesPanel } from "../components/AdminRolesPanel";
import { AdminSystemPanel } from "../components/AdminSystemPanel";
import { AdminUserRolesPanel } from "../components/AdminUserRolesPanel";
import { AdminAuditLogsPanel } from "../components/AdminAuditLogsPanel";

const rolesQueryKey = ["admin", "roles"];
const permissionsQueryKey = ["admin", "permissions"];
const auditLogsQueryKey = ["admin", "audit-logs"];

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  return fallback;
}

function hasStatus(error: unknown, status: number) {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    Number(error.status) === status
  );
}

export function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [userQuery, setUserQuery] = useState("");
  const [feedPage, setFeedPage] = useState(1);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [userRolesError, setUserRolesError] = useState<string | null>(null);

  const overviewQuery = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: adminApi.getOverview,
  });

  const rolesQuery = useQuery({
    queryKey: rolesQueryKey,
    queryFn: adminApi.getRoles,
    retry: false,
  });

  const permissionsQuery = useQuery({
    queryKey: permissionsQueryKey,
    queryFn: adminApi.getPermissions,
    retry: false,
  });

  const usersQuery = useQuery({
    queryKey: ["admin", "users", userQuery],
    queryFn: () => adminApi.searchUsers(userQuery),
  });

  const feedQuery = useQuery({
    queryKey: ["admin", "recent-feed", feedPage],
    queryFn: () => adminApi.getRecentFeed(feedPage, 5),
  });

  const auditLogsQuery = useQuery({
    queryKey: auditLogsQueryKey,
    queryFn: () => adminApi.getAuditLogs(1, 10),
  });

  const assignPermissionMutation = useMutation({
    mutationFn: ({
      roleId,
      permissionId,
    }: {
      roleId: number;
      permissionId: number;
    }) => adminApi.assignPermission(roleId, permissionId),
    onSuccess: async () => {
      setRolesError(null);
      await queryClient.invalidateQueries({ queryKey: rolesQueryKey });
      await queryClient.invalidateQueries({ queryKey: auditLogsQueryKey });
    },
    onError: (error) => {
      setRolesError(getErrorMessage(error, "Could not assign permission."));
    },
  });

  const removePermissionMutation = useMutation({
    mutationFn: ({
      roleId,
      permissionId,
    }: {
      roleId: number;
      permissionId: number;
    }) => adminApi.removePermission(roleId, permissionId),
    onSuccess: async () => {
      setRolesError(null);
      await queryClient.invalidateQueries({ queryKey: rolesQueryKey });
      await queryClient.invalidateQueries({ queryKey: auditLogsQueryKey });
    },
    onError: (error) => {
      setRolesError(getErrorMessage(error, "Could not remove permission."));
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: number; roleId: number }) =>
      adminApi.assignRole(userId, roleId),
    onSuccess: async () => {
      setUserRolesError(null);
      await queryClient.invalidateQueries({ queryKey: auditLogsQueryKey });
    },
    onError: (error) => {
      setUserRolesError(getErrorMessage(error, "Could not assign role."));
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: number; roleId: number }) =>
      adminApi.removeRole(userId, roleId),
    onSuccess: async () => {
      setUserRolesError(null);
      await queryClient.invalidateQueries({ queryKey: auditLogsQueryKey });
    },
    onError: (error) => {
      setUserRolesError(getErrorMessage(error, "Could not remove role."));
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => adminApi.deleteUser(userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      await queryClient.invalidateQueries({ queryKey: auditLogsQueryKey });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: number) => adminApi.deletePost(postId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "recent-feed"] });
      await queryClient.invalidateQueries({ queryKey: auditLogsQueryKey });
    },
  });

  const roles = rolesQuery.data ?? [];
  const permissions = permissionsQuery.data ?? [];
  const users = usersQuery.data ?? [];
  const recentPosts = feedQuery.data?.data ?? [];
  const auditLogs = auditLogsQuery.data?.data ?? [];

  const accessError = useMemo(() => {
    if (!rolesQuery.error && !permissionsQuery.error) {
      return null;
    }

    return getErrorMessage(
      rolesQuery.error ?? permissionsQuery.error,
      "Your account needs role administration permissions."
    );
  }, [permissionsQuery.error, rolesQuery.error]);
  const isAccessDenied =
    hasStatus(rolesQuery.error, 401) ||
    hasStatus(rolesQuery.error, 403) ||
    hasStatus(permissionsQuery.error, 401) ||
    hasStatus(permissionsQuery.error, 403);

  if (isAccessDenied) {
    return (
      <AppShell activeItem="Home Feed">
        <div className="mx-auto max-w-[56rem] space-y-5">
          <AdminAccessNotice
            message="This dashboard is only available to users with admin role permissions."
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeItem="Admin" rightRail={
      <AdminSystemPanel
        rolesCount={roles.length}
        permissionsCount={permissions.length}
      />
    }>
      <div className="mx-auto max-w-[76rem] space-y-5 pb-10">
        <AdminHero />

        <AdminMetricGrid
          overview={overviewQuery.data}
          isLoading={overviewQuery.isLoading}
        />

        {accessError ? <AdminAccessNotice message={accessError} /> : null}

        <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <AdminRolesPanel
            roles={roles}
            permissions={permissions}
            isSaving={
              assignPermissionMutation.isPending ||
              removePermissionMutation.isPending
            }
            error={rolesError}
            onAssignPermission={(roleId, permissionId) =>
              assignPermissionMutation.mutate({ roleId, permissionId })
            }
            onRemovePermission={(roleId, permissionId) =>
              removePermissionMutation.mutate({ roleId, permissionId })
            }
          />

          <AdminUserRolesPanel
            users={users}
            roles={roles}
            query={userQuery}
            isSaving={
              assignRoleMutation.isPending || 
              removeRoleMutation.isPending || 
              deleteUserMutation.isPending
            }
            error={userRolesError}
            onQueryChange={setUserQuery}
            onAssignRole={(userId, roleId) =>
              assignRoleMutation.mutate({ userId, roleId })
            }
            onRemoveRole={(userId, roleId) =>
              removeRoleMutation.mutate({ userId, roleId })
            }
            onDeleteUser={(userId) => deleteUserMutation.mutate(userId)}
          />
        </div>

        <AdminAuditLogsPanel 
          logs={auditLogs} 
          isLoading={auditLogsQuery.isLoading} 
        />

        <div className="grid gap-5 xl:hidden">
          <AdminSystemPanel
            rolesCount={roles.length}
            permissionsCount={permissions.length}
          />
        </div>

        <AdminRecentActivity
          posts={recentPosts}
          isLoading={feedQuery.isLoading}
          onDeletePost={(postId) => deletePostMutation.mutate(postId)}
          pagination={feedQuery.data?.meta}
          onPageChange={setFeedPage}
        />
      </div>
    </AppShell>
  );
}
