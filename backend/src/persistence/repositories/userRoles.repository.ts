import { prisma } from '../../database/prismaClients';

const userRoleRepository = {

    // Assigns a role to a user by creating a new record in the userRole table with the specified user ID and role ID.
    async assignRole(user_id: string, role_id: string) {
        return await prisma.userRole.create({
            data: {
                user_id,
                role_id,
            },
        });
    },

    // Retrieves all roles assigned to a specific user by their user ID, including the role details through a join with the role table.
    async findRolesByUserId(user_id: string) {
        return await prisma.userRole.findMany({
            where: { user_id },
            include: { role: true },
        });
    },

    // Removes a role from a user by deleting the corresponding record in the userRole table based on the user ID and role ID.
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