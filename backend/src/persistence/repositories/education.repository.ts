import { prisma } from '../../database/prismaClients';

interface EducationData {
    institution_id: number;
    field_id:       number | null;
    degree:         string | null;
    start_year:     number | null;
    end_year?:      number | null;
    description?:   string | null;
}

const educationRepository = {

    async findByUserId(user_id: number) {
        return await prisma.education.findMany({
            where: { user_id },
        });
    },

    async findById(id: number) {
        return await prisma.education.findUnique({
            where: { id },
        });
    },

    async isEducationOwnerByUser(education_id: number, user_id: number) {
        const education = await prisma.education.findUnique({
            where: { id: education_id },
            select: { user_id: true },
        });
        return education?.user_id === user_id;
    },

    async create(user_id: number, data: EducationData) {
        return await prisma.education.create({
           data: {
                user_id,
                institution_id: data.institution_id,
                field_id:       data.field_id    ?? null,
                degree:         data.degree      ?? null,
                start_year:     data.start_year  ?? null,
                end_year:       data.end_year    ?? null,
                description:    data.description ?? null,
            },
        });
    },

    async update(id: number, data: Partial<EducationData>) {
        return await prisma.education.update({
            where: { id },
            data,
        });
    },

    async delete(id: number) {
        return await prisma.education.delete({
            where: { id },
        });
    },

};

export default educationRepository;