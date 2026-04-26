import { prisma } from "../../database/prismaClients";

const followRepository = {
  async findUserById(userId: number) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
      },
    });
  },

  async findUserWithProfile(userId: number) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });
  },

  async findFollow(followerId: number, followingId: number) {
    return prisma.follow.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId,
        },
      },
    });
  },

  async createFollowRequest(
    followerId: number,
    followingId: number,
    status: string,
  ) {
    return prisma.follow.create({
      data: {
        follower_id: followerId,
        following_id: followingId,
        status,
      },
    });
  },

  async deleteFollow(followerId: number, followingId: number) {
    return prisma.follow.delete({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId,
        },
      },
    });
  },

  async updateStatus(followerId: number, followingId: number, status: string) {
    return prisma.follow.update({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId,
        },
      },
      data: {
        status,
        updated_at: new Date(),
      },
    });
  },

  async getFollowers(userId: number) {
    return prisma.follow.findMany({
      where: {
        following_id: userId,
        status: "accepted",
      },
      include: {
        follower: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });
  },

  async getFollowing(userId: number) {
    return prisma.follow.findMany({
      where: {
        follower_id: userId,
        status: "accepted",
      },
      include: {
        following: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });
  },

  async getPendingRequests(userId: number) {
    return prisma.follow.findMany({
      where: {
        following_id: userId,
        status: "pending",
      },
      include: {
        follower: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });
  },
};

export default followRepository;