import { prisma } from '../../database/prismaClients';

const userRoleRepository = {
    async assignRole(user_id: string, role_id: string) {
        return await prisma.userRole.create({
            data: {
                user_id,
                role_id,
            },
        });
    },

    async findRolesByUserId(user_id: string) {
        return await prisma.userRole.findMany({
            where: { user_id },
            include: { role: true },
        });
    },

    async removeRole(user_id: string, role_id: string) {
        return await prisma.userRole.deleteMany({
            where: {
                user_id,
                role_id,
            },
        });
    },
};

export default userRoleRepository;