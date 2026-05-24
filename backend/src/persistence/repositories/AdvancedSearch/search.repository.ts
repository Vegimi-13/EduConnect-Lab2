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
  async searchGroup(query: string, page: number, limit: number) {
    return prisma.group.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: {
        created_at: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
  },
  async searchInstitutions(query: string, page: number, limit: number) {
    return prisma.institution.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            city: {
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
        name: true,
        city: true,
      },
    });
  },
};

export default searchRepository;
