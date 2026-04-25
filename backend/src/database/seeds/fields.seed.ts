import { prisma } from './../prismaClients';

export async function seedFields() {
    await prisma.fieldOfStudy.createMany({
        data: [
            { name: 'Computer Science' },
            { name: 'Software Engineering' },
            { name: 'Business Administration' },
            { name: 'Economics' },
            { name: 'Law' },
            { name: 'Psychology' },
            { name: 'Medicine' },
            { name: 'Architecture' },
        ],
        skipDuplicates: true,
    });
    console.log('✅ Fields of study seeded');
}