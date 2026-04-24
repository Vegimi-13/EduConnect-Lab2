import { prisma } from '../../database/prismaClients';

const referenceRepository = {

    async findAllInstitutions() {
        return await prisma.institution.findMany({
            orderBy: { name: 'asc' },
        });
    },

    async findInstitutionById(id: number) {
        return await prisma.institution.findUnique({
            where: { id },
        });
    },

    async findAllFieldsOfStudy() {
        return await prisma.fieldOfStudy.findMany({
            orderBy: { name: 'asc' },
        });
    },

    async findFieldOfStudyById(id: number) {
        return await prisma.fieldOfStudy.findUnique({
            where: { id },
        });
    },

};

export default referenceRepository;