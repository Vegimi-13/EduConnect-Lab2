import { prisma } from '../../database/prismaClients';

const refreshTokenRepository = {
    async create(data: {
        user_id: string;
        token_hash: string;
        expires_at: Date;
    }) {
        return await prisma.refreshToken.create({
            data: {
                user_id: data.user_id,
                token_hash: data.token_hash,
                expires_at: data.expires_at,
            },
        });
    },

    async findActiveTokensByUserId(user_id: string) {
        return await prisma.refreshToken.findMany({
            where: {
                user_id,
                revoked_at: null,
                expires_at: { gt: new Date() },
            },
        });
    },

    async revokeToken(id: string) {
        return await prisma.refreshToken.update({
            where: { id },
            data: { revoked_at: new Date() },
        });
    },

    async revokeAllUserTokens(user_id: string) {
        return await prisma.refreshToken.updateMany({
            where: {
                user_id,
                revoked_at: null,
            },
            data: { revoked_at: new Date() },
        });
    },
};

export default refreshTokenRepository;