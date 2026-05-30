import { useMemo, useState } from "react";
import { KeyRound, Minus, Plus, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { AdminPermission, AdminRole } from "../types/admin.types";

type AdminRolesPanelProps = {
  roles: AdminRole[];
  permissions: AdminPermission[];
  isSaving: boolean;
  error?: string | null;
  onAssignPermission: (roleId: number, permissionId: number) => void;
  onRemovePermission: (roleId: number, permissionId: number) => void;
};

export function AdminRolesPanel({
  roles,
  permissions,
  isSaving,
  error,
  onAssignPermission,
  onRemovePermission,
}: AdminRolesPanelProps) {
  const [roleId, setRoleId] = useState("");
  const [permissionId, setPermissionId] = useState("");

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === Number(roleId)),
    [roleId, roles]
  );

  const availablePermissions = useMemo(() => {
    const assigned = new Set(
      selectedRole?.role_permissions.map((item) => item.permission_id) ?? []
    );

    return permissions.filter((permission) => !assigned.has(permission.id));
  }, [permissions, selectedRole]);

  function handleAssign() {
    const nextRoleId = Number(roleId);
    const nextPermissionId = Number(permissionId);

    if (nextRoleId && nextPermissionId) {
      onAssignPermission(nextRoleId, nextPermissionId);
      setPermissionId("");
    }
  }

  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardHeader className="p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Shield className="size-5" />
          Roles & Permissions
        </h2>
      </CardHeader>
      <CardContent className="space-y-5 px-5 pb-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <select
            value={roleId}
            onChange={(event) => {
              setRoleId(event.target.value);
              setPermissionId("");
            }}
            className="h-11 rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
          >
            <option value="">Select role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          <select
            value={permissionId}
            onChange={(event) => setPermissionId(event.target.value)}
            className="h-11 rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
            disabled={!selectedRole}
          >
            <option value="">Select permission</option>
            {availablePermissions.map((permission) => (
              <option key={permission.id} value={permission.id}>
                {permission.name}
              </option>
            ))}
          </select>

          <Button
            className="h-11 bg-[#073f43] px-4 text-white hover:bg-[#062f33]"
            disabled={!roleId || !permissionId || isSaving}
            onClick={handleAssign}
          >
            <Plus className="size-4" />
            Add
          </Button>
        </div>

        {error ? (
          <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="grid gap-3">
          {roles.map((role) => (
            <div
              key={role.id}
              className="rounded-md border border-[#d6dde3] bg-[#f8fafc] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-[#061f22]">{role.name}</h3>
                  <p className="mt-1 text-sm text-[#4b5563]">
                    {role.description || "No description"}
                  </p>
                </div>
                <span className="rounded-md bg-[#edf3fb] px-2.5 py-1 text-xs font-semibold text-[#073f43]">
                  {role.role_permissions.length} permissions
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {role.role_permissions.length ? (
                  role.role_permissions.map((item) => (
                    <button
                      key={item.permission_id}
                      type="button"
                      className="inline-flex items-center gap-2 rounded-md border border-[#b8c4c7] bg-white px-3 py-1.5 text-xs font-medium text-[#263336] transition hover:bg-[#fff7f0]"
                      onClick={() =>
                        onRemovePermission(role.id, item.permission_id)
                      }
                      disabled={isSaving}
                    >
                      <KeyRound className="size-3" />
                      {item.permission.name}
                      <Minus className="size-3 text-[#8a1f1f]" />
                    </button>
                  ))
                ) : (
                  <span className="text-sm text-[#6b7280]">
                    No permissions assigned.
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
