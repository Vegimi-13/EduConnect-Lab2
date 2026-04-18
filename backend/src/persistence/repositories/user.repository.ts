import { prisma } from '../../database/prismaClients';
import { RegisterDtoType } from '../../business/dto/register.dto';

const userRepository = {
    async findByEmail(email: string) {
        return await prisma.user.findUnique({
            where: { email },
        });
    },

    async findById(id: string) {
        return await prisma.user.findUnique({
            where: { id },
        });
    },

    async create(data: RegisterDtoType & { password_hash: string }) {
        return await prisma.user.create({
            data: {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                password_hash: data.password_hash,
            },
        });
    },
};

export default userRepository;