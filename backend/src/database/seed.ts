// prisma/seed.ts
import { seedInstitutions } from "./seeds/institutions.seed";
import { seedFields } from "./seeds/fields.seed";
import { seedCourses } from "./seeds/courses.seed";
import { seedRoles } from "./seeds/roles.seed";
import { prisma } from "./prismaClients";

async function main() {
  await seedRoles();
  await seedInstitutions();
  await seedFields();
  await seedCourses(); // depends on the two above
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
