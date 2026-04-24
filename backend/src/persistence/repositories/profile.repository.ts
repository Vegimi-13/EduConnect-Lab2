import { prisma } from '../../database/prismaClients';

interface UpdateProfileData {
    first_name?: string;
    last_name?: string;
    headline?: string | null;
    bio?: string | null;
    location?: string | null;
    website_url?: string | null;
    visibility?: 'public' | 'private';
}

const profileRepository = {
    async createProfile(user_id: number) {
        return await prisma.profile.create({
            data: { user_id },
        })
    },

    async updateProfile(user_id: number, data: UpdateProfileData) {
        return await prisma.profile.update({
            where: { user_id },
            data,
        })
    },

    async findProfileByUserId(user_id: number) {
        return await prisma.profile.findUnique({
            where: { user_id },
        })
    },
}

export default profileRepository;