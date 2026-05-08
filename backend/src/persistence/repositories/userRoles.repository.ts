import { prisma } from '../../database/prismaClients';

const userRoleRepository = {
    // Assigns a role to a user.
    async assignRole(user_id: number, role_id: number) {
        return await prisma.userRole.upsert({
            where: {
                user_id_role_id: {
                    user_id,
                    role_id,
                },
            },
            update: {},
            create: {
              user_id,
              role_id,
            },
        });
    },

    // Retrieves all roles assigned to a specific user.
    async findRolesByUserId(user_id: number) {
        return await prisma.userRole.findMany({
            where: { user_id },
            include: { role: true },
        });
    },

    // Removes a role from a user.
    async removeRole(user_id: number, role_id: number) {
        return await prisma.userRole.deleteMany({
            where: {
                user_id,
                role_id,
            },
        });
    },
};

export default userRoleRepository;
