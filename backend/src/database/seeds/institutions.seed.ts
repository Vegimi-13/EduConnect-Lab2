import { prisma } from './../prismaClients';

export async function seedInstitutions() {
    await prisma.institution.createMany({
        data: [
            { name: 'University of Prishtina', country: 'Kosovo', city: 'Prishtina', website: 'https://uni-pr.edu' },
            { name: 'RIT Kosovo', country: 'Kosovo', city: 'Prishtina', website: 'https://rit-kosovo.edu' },
            { name: 'AAB College', country: 'Kosovo', city: 'Prishtina', website: 'https://aab-edu.net' },
        ],
        skipDuplicates: true,
    });
    console.log('✅ Institutions seeded');
}