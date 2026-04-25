import { prisma } from "./../prismaClients";

export async function seedRoles() {
  await prisma.role.createMany({
    data: [{ name: "admin" }, { name: "user" }, { name: "moderator" }],
    skipDuplicates: true,
  });
  console.log("✅ Roles seeded");
}
