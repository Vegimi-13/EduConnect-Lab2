import { prisma } from "../../../database/prismaClients";

//create the function here based on other repos

const searchRepository = {
  async searchUsers(query: string, page: number, limit: number) {
    return prisma.user.findMany({
      where: {
        OR: [
          {
            first_name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            last_name: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
      },
    });
  },
};

export default searchRepository;
