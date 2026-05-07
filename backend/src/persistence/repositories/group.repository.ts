import { prisma } from "../../database/prismaClients";

const groupRepository = {
  async createGroup(data: {
    owner_id: number;
    name: string;
    description?: string;
    visibility?: string;
  }) {
    return prisma.group.create({
      data: {
        ...data,
        group_members: {
          create: {
            user_id: data.owner_id,
            role: "owner",
            status: "active",
          },
        },
      },
      include: {
        group_members: true,
      },
    });
  },

  async findGroupById(groupId: number) {
    return prisma.group.findUnique({
      where: { id: groupId },
    });
  },

  async updateGroup(groupId: number, data: any) {
    return prisma.group.update({
      where: { id: groupId },
      data,
    });
  },

  async deleteGroup(groupId: number) {
    return prisma.group.delete({
      where: { id: groupId },
    });
  },

  async getUserGroups(userId: number) {
    return prisma.groupMember.findMany({
      where: {
        user_id: userId,
      },
      include: {
        group: true,
      },
    });
  },

  async findMembership(groupId: number, userId: number) {
    return prisma.groupMember.findUnique({
      where: {
        group_id_user_id: {
          group_id: groupId,
          user_id: userId,
        },
      },
    });
  },

  async createJoinRequest(groupId: number, userId: number) {
    return prisma.groupJoinRequest.create({
      data: {
        group_id: groupId,
        user_id: userId,
        status: "pending",
      },
    });
  },

  async findJoinRequest(requestId: number) {
    return prisma.groupJoinRequest.findUnique({
      where: { id: requestId },
    });
  },

  async updateJoinRequest(requestId: number, status: string) {
    return prisma.groupJoinRequest.update({
      where: { id: requestId },
      data: {
        status,
        reviewed_at: new Date(),
      },
    });
  },

  async addGroupMember(groupId: number, userId: number, role = "member") {
    return prisma.groupMember.create({
      data: {
        group_id: groupId,
        user_id: userId,
        role,
        status: "active",
      },
    });
  },

  async getGroupMembers(groupId: number) {
    return prisma.groupMember.findMany({
      where: { group_id: groupId },
      include: {
        user: {
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

  async updateGroupMember(
    groupId: number,
    userId: number,
    data: {
      role?: string;
      status?: string;
    },
  ) {
    return prisma.groupMember.update({
      where: {
        group_id_user_id: {
          group_id: groupId,
          user_id: userId,
        },
      },
      data,
    });
  },

  async removeGroupMember(groupId: number, userId: number) {
    return prisma.groupMember.delete({
      where: {
        group_id_user_id: {
          group_id: groupId,
          user_id: userId,
        },
      },
    });
  },

  async createChannel(groupId: number, data: {
    name: string;
    type: string;
    description?: string;
  }) {
    return prisma.groupChannel.create({
      data: {
        group_id: groupId,
        name: data.name,
        type: data.type,
        description: data.description,
      },
    });
  },

  async getGroupChannels(groupId: number) {
    return prisma.groupChannel.findMany({
      where: { group_id: groupId },
      orderBy: {
        created_at: "asc",
      },
    });
  },

  async updateChannel(channelId: number, data: {
    name?: string;
    type?: string;
    description?: string;
  }) {
    return prisma.groupChannel.update({
      where: { id: channelId },
      data,
    });
  },

  async deleteChannel(channelId: number) {
    return prisma.groupChannel.delete({
      where: { id: channelId },
    });
  },
};

export default groupRepository;