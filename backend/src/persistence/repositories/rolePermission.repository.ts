import { prisma } from "../../database/prismaClients";

const rolePermissionRepository = {
  async assignPermission(role_id: number, permission_id: number) {
    return prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: {
          role_id,
          permission_id,
        },
      },
      update: {},
      create: {
        role_id,
        permission_id,
      },
    });
  },

  async removePermission(role_id: number, permission_id: number) {
    return prisma.rolePermission.deleteMany({
      where: {
        role_id,
        permission_id,
      },
    });
  },
};

export default rolePermissionRepository;
