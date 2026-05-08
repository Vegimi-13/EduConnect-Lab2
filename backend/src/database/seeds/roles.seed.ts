import { prisma } from "./../prismaClients";

const userPermissions = [
  { name: "profile.manage", description: "Manage own profile" },
  { name: "posts.create", description: "Create posts and post attachments" },
  { name: "comments.create", description: "Comment on posts" },
  { name: "reactions.create", description: "React to posts and comments" },
  { name: "groups.create", description: "Create and join groups" },
  { name: "messages.send", description: "Send messages in conversations" },
  { name: "notifications.read", description: "Read own notifications" },
];

const adminPermissions = [
  { name: "roles.read", description: "View roles and permissions" },
  { name: "roles.manage", description: "Assign roles and permissions" },
  { name: "users.manage", description: "Manage users" },
  { name: "content.moderate", description: "Moderate posts, comments, and groups" },
];

export async function seedRoles() {
  await prisma.role.createMany({
    data: [{ name: "admin" }, { name: "user" }],
    skipDuplicates: true,
  });

  await prisma.permission.createMany({
    data: [...userPermissions, ...adminPermissions],
    skipDuplicates: true,
  });

  const userRole = await prisma.role.findUnique({ where: { name: "user" } });
  const adminRole = await prisma.role.findUnique({ where: { name: "admin" } });
  const permissions = await prisma.permission.findMany();

  if (userRole) {
    const userPermissionNames = new Set(userPermissions.map((permission) => permission.name));
    const permissionsForUser = permissions.filter((permission) =>
      userPermissionNames.has(permission.name),
    );

    await prisma.rolePermission.createMany({
      data: permissionsForUser.map((permission) => ({
        role_id: userRole.id,
        permission_id: permission.id,
      })),
      skipDuplicates: true,
    });
  }

  if (adminRole) {
    await prisma.rolePermission.createMany({
      data: permissions.map((permission) => ({
        role_id: adminRole.id,
        permission_id: permission.id,
      })),
      skipDuplicates: true,
    });
  }

  console.log("Roles and permissions seeded");
}
