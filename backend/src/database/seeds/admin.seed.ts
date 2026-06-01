import { prisma } from "../prismaClients";

export async function seedAdminUser(adminEmail = process.env.ADMIN_EMAIL) {
  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL is required to seed an admin user");
  }

  const normalizedEmail = adminEmail.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new Error(`User with email ${normalizedEmail} was not found`);
  }

  const adminRole = await prisma.role.findUnique({
    where: { name: "admin" },
  });

  if (!adminRole) {
    throw new Error("Admin role was not found. Run the roles seed first.");
  }

  await prisma.userRole.upsert({
    where: {
      user_id_role_id: {
        user_id: user.id,
        role_id: adminRole.id,
      },
    },
    update: {},
    create: {
      user_id: user.id,
      role_id: adminRole.id,
    },
  });

  console.log(`Admin role assigned to ${normalizedEmail}`);
}
