import { prisma } from "./../prismaClients";

export async function seedCategories() {
  await prisma.category.createMany({
    data: [
      { name: "Tech" },
      { name: "Business" },
      { name: "Science" },
      { name: "Education" },
      { name: "Health" },
      { name: "Programming" },
      { name: "AI" },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Categories seeded");
}
