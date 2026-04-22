import { prisma } from '../../database/prismaClients';
interface CreateRefreshTokenData {
    user_id: number;
    token_hash: string;
    expires_at?: Date;
}

const refreshTokenRepository = {
    // Creates a new refresh token for a user, storing the hashed token and its expiration time in the database.
    async create(data: CreateRefreshTokenData) {
        return await prisma.refreshToken.create({
            data: {
                user_id: data.user_id,
                token_hash: data.token_hash,
                expires_at: data.expires_at ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
    },

    // Finds a refresh token in the database by its hashed value.
    async findByUserId(user_id: number) {
        return await prisma.refreshToken.findMany({
            where: { user_id, revoked_at: null },
        });
    },

    // Revokes a refresh token by setting revoked_at.
    async revokeToken(id: number) {
        return await prisma.refreshToken.update({
            where: { id },
            data: { revoked_at: new Date() },
        });
    },
};

export default refreshTokenRepository;