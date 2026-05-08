import { z } from "zod";

export const AssignRoleDto = z.object({
  role_id: z.number().int().positive(),
});

export const AssignPermissionDto = z.object({
  permission_id: z.number().int().positive(),
});

export const UserIdParamDto = z.object({
  userId: z.string().transform((value) => Number(value)),
});

export const RoleIdParamDto = z.object({
  roleId: z.string().transform((value) => Number(value)),
});

export const PermissionIdParamDto = z.object({
  permissionId: z.string().transform((value) => Number(value)),
});

export type AssignRoleDtoType = z.infer<typeof AssignRoleDto>;
export type AssignPermissionDtoType = z.infer<typeof AssignPermissionDto>;
