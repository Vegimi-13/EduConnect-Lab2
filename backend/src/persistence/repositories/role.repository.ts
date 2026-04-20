import { prisma } from '../../database/prismaClients';

const roleRepository = {

    // Finds a role in the database by its unique name, allowing for role-based access control checks.
    async findByName(name: string) {
        return await prisma.role.findUnique({
            where: { name },
        });
    },

    // Finds a role in the database by its unique identifier, useful for retrieving role details or permissions.
    async findById(id: string) {
        return await prisma.role.findUnique({
            where: { id },
        });
    },
};

export default roleRepository;