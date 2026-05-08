import { prisma } from '../../database/prismaClients';

const roleRepository = {
    async findAll() {
        return await prisma.role.findMany({
            include: {
                role_permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    },

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
            include: {
                role_permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
    },
};

export default roleRepository;
