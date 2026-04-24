import { prisma } from '../../database/prismaClients';

const skillsRepository = {
    async userHasSkill(user_id: number, skill_id: number) {
        const userSkill = await prisma.userSkill.findUnique({
            where: {
                user_id_skill_id: {
                    user_id,
                    skill_id,
                },
            },
        });
        return userSkill !== null;
    },
    async addSkillToUser(user_id: number, skill_id: number) {
        return await prisma.userSkill.create({
            data: {
                user_id,
                skill_id,
            },
        });
    },
    async findByUserId(user_id: number) {
        return await prisma.userSkill.findMany({
            where: { user_id}
        })
    },
    async removeSkillFromUser(user_id: number, skill_id: number) {
        return await prisma.userSkill.delete({
            where: {
                user_id_skill_id: {
                    user_id,
                    skill_id,
                },
            },
        });
    }
};

export default skillsRepository;