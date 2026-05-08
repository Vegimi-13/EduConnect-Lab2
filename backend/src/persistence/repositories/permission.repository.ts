import { prisma } from "../../database/prismaClients";

const permissionRepository = {
  async findAll() {
    return prisma.permission.findMany({
      orderBy: { name: "asc" },
    });
  },

  async findByName(name: string) {
    return prisma.permission.findUnique({
      where: { name },
    });
  },

  async findById(id: number) {
    return prisma.permission.findUnique({
      where: { id },
    });
  },

  async userHasPermission(user_id: number, permissionName: string) {
    const permission = await prisma.permission.findFirst({
      where: {
        name: permissionName,
        role_permissions: {
          some: {
            role: {
              user_roles: {
                some: { user_id },
              },
            },
          },
        },
      },
    });

    return !!permission;
  },
};

export default permissionRepository;
