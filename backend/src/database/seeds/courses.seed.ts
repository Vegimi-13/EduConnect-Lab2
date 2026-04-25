// prisma/seeds/courses.seed.ts
import { prisma } from './../prismaClients';

export async function seedCourses() {
    const [upInstitution, ritInstitution, aabInstitution] = await Promise.all([
        prisma.institution.findFirst({ where: { name: 'University of Prishtina' } }),
        prisma.institution.findFirst({ where: { name: 'RIT Kosovo' } }),
        prisma.institution.findFirst({ where: { name: 'AAB College' } }),
    ]);

    const [csField, seField, baField, ecoField] = await Promise.all([
        prisma.fieldOfStudy.findFirst({ where: { name: 'Computer Science' } }),
        prisma.fieldOfStudy.findFirst({ where: { name: 'Software Engineering' } }),
        prisma.fieldOfStudy.findFirst({ where: { name: 'Business Administration' } }),
        prisma.fieldOfStudy.findFirst({ where: { name: 'Economics' } }),
    ]);

    await prisma.course.createMany({
        data: [
            // University of Prishtina - Computer Science
            { institution_id: upInstitution!.id, field_id: csField!.id, code: 'UP-CS101', name: 'Introduction to Programming' },
            { institution_id: upInstitution!.id, field_id: csField!.id, code: 'UP-CS201', name: 'Data Structures & Algorithms' },
            { institution_id: upInstitution!.id, field_id: csField!.id, code: 'UP-CS301', name: 'Database Systems' },

            // University of Prishtina - Software Engineering
            { institution_id: upInstitution!.id, field_id: seField!.id, code: 'UP-SE101', name: 'Software Engineering Fundamentals' },
            { institution_id: upInstitution!.id, field_id: seField!.id, code: 'UP-SE201', name: 'Software Architecture' },

            // University of Prishtina - Economics
            { institution_id: upInstitution!.id, field_id: ecoField!.id, code: 'UP-ECO101', name: 'Microeconomics' },
            { institution_id: upInstitution!.id, field_id: ecoField!.id, code: 'UP-ECO201', name: 'Macroeconomics' },

            // RIT Kosovo - Computer Science
            { institution_id: ritInstitution!.id, field_id: csField!.id, code: 'RIT-CS101', name: 'Intro to Computer Science' },
            { institution_id: ritInstitution!.id, field_id: csField!.id, code: 'RIT-CS201', name: 'Web Development' },
            { institution_id: ritInstitution!.id, field_id: csField!.id, code: 'RIT-CS301', name: 'Cloud Computing' },

            // RIT Kosovo - Software Engineering
            { institution_id: ritInstitution!.id, field_id: seField!.id, code: 'RIT-SE101', name: 'Agile Development' },
            { institution_id: ritInstitution!.id, field_id: seField!.id, code: 'RIT-SE201', name: 'DevOps & CI/CD' },

            // AAB College - Business Administration
            { institution_id: aabInstitution!.id, field_id: baField!.id, code: 'AAB-BA101', name: 'Principles of Management' },
            { institution_id: aabInstitution!.id, field_id: baField!.id, code: 'AAB-BA201', name: 'Marketing Fundamentals' },

            // AAB College - Economics
            { institution_id: aabInstitution!.id, field_id: ecoField!.id, code: 'AAB-ECO101', name: 'Business Economics' },
        ],
        skipDuplicates: true,
    });
    console.log('✅ Courses seeded');
}