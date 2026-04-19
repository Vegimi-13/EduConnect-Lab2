import { prisma } from '../../database/prismaClients';

const roleRepository = {
    async findByName(name: string) {
        return await prisma.role.findUnique({
            where: { name },
        });
    },

    async findById(id: string) {
        return await prisma.role.findUnique({
            where: { id },
        });
    },
};

export default roleRepository;