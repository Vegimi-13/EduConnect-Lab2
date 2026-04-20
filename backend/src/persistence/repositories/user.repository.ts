import { prisma } from '../../database/prismaClients';

const userRepository = {

    // Finds a user in the database by their email address, allowing for user authentication and retrieval of user details.
    async findByEmail(email: string) {
        return await prisma.users.findUnique({
            where: { email },
        });
    },

    // Finds a user in the database by their unique identifier, useful for retrieving user details or performing user-specific operations.
    async findById(id: string) {
        return await prisma.users.findUnique({
            where: { id },
        });
    },

    // Creates a new user in the database with the provided first name, last name, email, and hashed password, returning the created user record.
    async create(first_name: string, last_name: string, email: string, password_hash: string) {
        return await prisma.users.create({
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