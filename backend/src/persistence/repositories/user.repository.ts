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

    async delete(id: number) {
        return await prisma.user.update({
            where: { id },
            data: { is_active: false },
        });
    },

    async findMany(page: number = 1, limit: number = 10, query?: string) {
        const skip = (page - 1) * limit;
        const where = query ? {
            OR: [
                { first_name: { contains: query, mode: 'insensitive' as const } },
                { last_name: { contains: query, mode: 'insensitive' as const } },
                { email: { contains: query, mode: 'insensitive' as const } },
            ]
        } : {};

        const [users, total] = await prisma.$transaction([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    user_roles: {
                        include: {
                            role: true
                        }
                    }
                }
            }),
            prisma.user.count({ where }),
        ]);

        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    },
};

export default userRepository;