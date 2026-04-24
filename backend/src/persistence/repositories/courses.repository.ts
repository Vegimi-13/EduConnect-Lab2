import { prisma } from '../../database/prismaClients';

interface CourseData {
    course_id: number;
    semester:  string | null;
    year:      number | null;
}

const courseRepository = {

    async findAllCourses(filters: { institution_id?: number; field_id?: number } = {}) {
        return await prisma.course.findMany({
            where: {
                ...(filters.institution_id ? { institution_id: filters.institution_id } : {}),
                ...(filters.field_id       ? { field_id:       filters.field_id }       : {}),
            },
            include: {
                institution: { select: { id: true, name: true } },
                field:       { select: { id: true, name: true } },
            },
            orderBy: { name: 'asc' },
        });
    },

    async findByUserId(user_id: number) {
        return await prisma.userCourse.findMany({
            where: { user_id },
            include: {
                course: {
                    include: {
                        institution: { select: { id: true, name: true } },
                        field:       { select: { id: true, name: true } },
                    },
                },
            },
            orderBy: [{ year: 'desc' }, { semester: 'asc' }],
        });
    },

    async findById(course_id: number) {
        return await prisma.course.findUnique({
            where: { id: course_id },
            include: {
                institution: { select: { id: true, name: true } },
                field:       { select: { id: true, name: true } },
            },
        });
    },

    async userHasCourse(user_id: number, course_id: number) {
        const record = await prisma.userCourse.findUnique({
            where: { user_id_course_id: { user_id, course_id } },
        });
        return record !== null;
    },

    async create(user_id: number, data: CourseData) {
        return await prisma.userCourse.create({
            data: {
                user_id,
                course_id: data.course_id,
                semester:  data.semester ?? null,
                year:      data.year     ?? null,
            },
        });
    },

    async delete(user_id: number, course_id: number) {
        return await prisma.userCourse.delete({
            where: { user_id_course_id: { user_id, course_id } },
        });
    },

};

export default courseRepository;