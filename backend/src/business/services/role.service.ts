import permissionRepository from "../../persistence/repositories/permission.repository";
import roleRepository from "../../persistence/repositories/role.repository";
import rolePermissionRepository from "../../persistence/repositories/rolePermission.repository";
import userRepository from "../../persistence/repositories/user.repository";
import userRoleRepository from "../../persistence/repositories/userRoles.repository";

const roleService = {
  async getRoles() {
    return roleRepository.findAll();
  },

  async getPermissions() {
    return permissionRepository.findAll();
  },

  async assignRole(userId: number, roleId: number) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const role = await roleRepository.findById(roleId);
    if (!role) throw new Error("Role not found");

    return userRoleRepository.assignRole(userId, roleId);
  },

  async removeRole(userId: number, roleId: number) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const role = await roleRepository.findById(roleId);
    if (!role) throw new Error("Role not found");

    return userRoleRepository.removeRole(userId, roleId);
  },

  async assignPermission(roleId: number, permissionId: number) {
    const role = await roleRepository.findById(roleId);
    if (!role) throw new Error("Role not found");

    const permission = await permissionRepository.findById(permissionId);
    if (!permission) throw new Error("Permission not found");

    return rolePermissionRepository.assignPermission(roleId, permissionId);
  },

  async removePermission(roleId: number, permissionId: number) {
    const role = await roleRepository.findById(roleId);
    if (!role) throw new Error("Role not found");

    return rolePermissionRepository.removePermission(roleId, permissionId);
  },
};

export default roleService;
