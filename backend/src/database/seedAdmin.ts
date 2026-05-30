import { seedRoles } from "./seeds/roles.seed";
import { seedAdminUser } from "./seeds/admin.seed";
import { prisma } from "./prismaClients";

async function main() {
  await seedRoles();
  await seedAdminUser();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
