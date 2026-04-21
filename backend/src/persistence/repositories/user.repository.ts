import { prisma } from '../../database/prismaClients';

const userRepository = {
    // Finds a user in the database by their email address.
    async findByEmail(email: string) {
        return await prisma.user.findUnique({
            where: { email },
        });
    },

    // Finds a user in the database by their unique identifier.
    async findById(id: number) {
        return await prisma.user.findUnique({
            where: { id },
        });
    },

    // Creates a new user in the database.
    async create(
        first_name: string,
        last_name: string,
        email: string,
        password_hash: string
    ) {
        return await prisma.user.create({
            data: {
                first_name,
                last_name,
                email,
                password_hash,
            },
        });
    },
};

export default userRepository;