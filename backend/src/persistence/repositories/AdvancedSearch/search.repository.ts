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
  async searchGroup(query: string, page: number, limit: number, viewerId: number) {
    const trimmedQuery = query?.trim();

    const groups = await prisma.group.findMany({
      where: trimmedQuery
        ? {
            OR: [
              {
                name: {
                  contains: trimmedQuery,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: trimmedQuery,
                  mode: "insensitive",
                },
              },
            ],
          }
        : undefined,
      orderBy: {
        created_at: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        owner_id: true,
        name: true,
        description: true,
        visibility: true,
        created_at: true,
        owner: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        _count: {
          select: {
            group_members: true,
            posts: true,
            group_channels: true,
          },
        },
        group_members: {
          where: {
            user_id: viewerId,
          },
          select: {
            role: true,
            status: true,
          },
        },
        group_join_requests: {
          where: {
            user_id: viewerId,
          },
          orderBy: {
            created_at: "desc",
          },
          take: 1,
          select: {
            id: true,
            status: true,
            created_at: true,
          },
        },
      },
    });

    return groups.map(({ group_members, group_join_requests, _count, ...group }) => ({
      ...group,
      counts: {
        members: _count.group_members,
        posts: _count.posts,
        channels: _count.group_channels,
      },
      viewer: {
        membership: group_members[0] ?? null,
        join_request: group_join_requests[0] ?? null,
      },
    }));
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
