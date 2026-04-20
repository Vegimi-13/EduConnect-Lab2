import { prisma } from '../../database/prismaClients';

const refreshTokenRepository = {

    // Creates a new refresh token for a user, storing the hashed token and its expiration time in the database.
    async create(data: {
        user_id: string;
        token_hash: string;
        expires_at?: Date;
    }) {
        return await prisma.refreshToken.create({
            data: {
                user_id: data.user_id,
                token_hash: data.token_hash,
                expires_at: data.expires_at,
            },
        });
    },

    // Finds a refresh token in the database by its hashed value, allowing for token validation during authentication.
    async findByTokenHash(token_hash: string) {
        return await prisma.refreshToken.findUnique({
            where: {token_hash},
        })
    },

    // Revokes a refresh token by setting its revoked_at timestamp to the current date and time.
    async revokeToken(id: string) {
        return await prisma.refreshToken.update({
            where: { id },
            data: { revoked_at: new Date() },
        });
    },

};

export default refreshTokenRepository;