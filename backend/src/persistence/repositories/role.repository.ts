import { prisma } from '../../database/prismaClients';

const roleRepository = {
    // Finds a role in the database by its unique name.
    async findByName(name: string) {
        return await prisma.role.findUnique({
            where: { name },
        });
    },

    // Finds a role in the database by its unique identifier.
    async findById(id: number) {
        return await prisma.role.findUnique({
            where: { id },
        });
    },
};

export default roleRepository;