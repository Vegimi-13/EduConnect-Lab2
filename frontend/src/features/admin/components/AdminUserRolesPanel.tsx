import { useState } from "react";
import { Search, Trash2, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AdminRole, AdminUser } from "../types/admin.types";

type AdminUserRolesPanelProps = {
  users: AdminUser[];
  roles: AdminRole[];
  query: string;
  isSaving: boolean;
  error?: string | null;
  onQueryChange: (query: string) => void;
  onAssignRole: (userId: number, roleId: number) => void;
  onRemoveRole: (userId: number, roleId: number) => void;
  onDeleteUser: (userId: number) => void;
};

function getUserName(user: AdminUser) {
  return `${user.first_name} ${user.last_name}`.trim() || user.email;
}

function getInitials(user: AdminUser) {
  return `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`
    .trim()
    .toUpperCase() || user.email.slice(0, 2).toUpperCase();
}

export function AdminUserRolesPanel({
  users,
  roles,
  query,
  isSaving,
  error,
  onQueryChange,
  onAssignRole,
  onRemoveRole,
  onDeleteUser,
}: AdminUserRolesPanelProps) {
  const [roleByUser, setRoleByUser] = useState<Record<number, string>>({});

  function getSelectedRole(userId: number) {
    return Number(roleByUser[userId] ?? 0);
  }

  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardHeader className="p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <UserCog className="size-5" />
          User Management
        </h2>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#4b5563]" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="pl-10"
            placeholder="Search users by name"
          />
        </div>

        {error ? (
          <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="space-y-3">
          {users.map((user) => {
            const selectedRole = getSelectedRole(user.id);

            return (
              <div
                key={user.id}
                className="rounded-md border border-[#d6dde3] bg-[#f8fafc] p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-[#0b5557] text-xs font-bold text-white">
                      {getInitials(user)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#061f22]">
                        {getUserName(user)}
                      </h3>
                      <p className="text-sm text-[#4b5563]">{user.email}</p>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-[minmax(0,12rem)_auto_auto_auto]">
                    <select
                      value={roleByUser[user.id] ?? ""}
                      onChange={(event) =>
                        setRoleByUser((current) => ({
                          ...current,
                          [user.id]: event.target.value,
                        }))
                      }
                      className="h-10 rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                    >
                      <option value="">Select role</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>

                    <Button
                      className="bg-[#073f43] text-white hover:bg-[#062f33]"
                      disabled={!selectedRole || isSaving}
                      onClick={() => onAssignRole(user.id, selectedRole)}
                    >
                      Assign
                    </Button>
                    <Button
                      variant="outline"
                      disabled={!selectedRole || isSaving}
                      onClick={() => onRemoveRole(user.id, selectedRole)}
                    >
                      Remove
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-10 w-10"
                      disabled={isSaving}
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete user ${getUserName(user)}?`)) {
                          onDeleteUser(user.id);
                        }
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {!users.length ? (
            <p className="rounded-md border border-dashed border-[#b8c4c7] p-5 text-sm text-[#4b5563]">
              No users found for this search.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
