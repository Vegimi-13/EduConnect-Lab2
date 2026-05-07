import groupRepository from "../../persistence/repositories/group.repository";

const groupService = {
  async createGroup(
    userId: number,
    data: {
      name: string;
      description?: string;
      visibility?: string;
    },
  ) {
    if (!data.name?.trim()) {
      throw new Error("Group name is required");
    }
    return groupRepository.createGroup({
      owner_id: userId,
      name: data.name,
      description: data.description,
      visibility: data.visibility ?? "public",
    });
  },

  async getGroupById(groupId: number) {
    const group = await groupRepository.findGroupById(groupId);

    if (!group) {
      throw new Error("Group not found");
    }

    return group;
  },

  async updateGroup(
    currentUserId: number,
    groupId: number,
    data: {
      name?: string;
      description?: string;
      visibility?: string;
    },
  ) {
    const group = await groupRepository.findGroupById(groupId);

    if (!group) {
      throw new Error("Group not found");
    }

    if (group.owner_id !== currentUserId) {
      throw new Error("Only group owner can update this group");
    }

    return groupRepository.updateGroup(groupId, {
      ...data,
      updated_at: new Date(),
    });
  },

  async deleteGroup(currentUserId: number, groupId: number) {
    const group = await groupRepository.findGroupById(groupId);

    if (!group) {
      throw new Error("Group not found");
    }

    if (group.owner_id !== currentUserId) {
      throw new Error("Only group owner can delete this group");
    }

    return groupRepository.deleteGroup(groupId);
  },

  async getMyGroups(userId: number) {
    return groupRepository.getUserGroups(userId);
  },

  async joinGroup(currentUserId: number, groupId: number) {
    const group = await groupRepository.findGroupById(groupId);

    if (!group) {
      throw new Error("Group not found");
    }

    const membership = await groupRepository.findMembership(groupId, currentUserId);

    if (membership) {
      throw new Error("You are already a member of this group");
    }

    if (group.visibility === "public") {
      return groupRepository.addGroupMember(groupId, currentUserId);
    }

    return groupRepository.createJoinRequest(groupId, currentUserId);
  },

  async handleJoinRequest(
    currentUserId: number,
    groupId: number,
    requestId: number,
    status: string,
  ) {
    const group = await groupRepository.findGroupById(groupId);

    if (!group) {
      throw new Error("Group not found");
    }

    if (group.owner_id !== currentUserId) {
      throw new Error("Only group owner can manage join requests");
    }

    const request = await groupRepository.findJoinRequest(requestId);

    if (!request || request.group_id !== groupId) {
      throw new Error("Join request not found");
    }

    if (request.status !== "pending") {
      throw new Error(`Request is already ${request.status}`);
    }

    if (status !== "accepted" && status !== "rejected") {
      throw new Error("Status must be accepted or rejected");
    }

    const updatedRequest = await groupRepository.updateJoinRequest(requestId, status);

    if (status === "accepted") {
      const existingMember = await groupRepository.findMembership(
        groupId,
        request.user_id,
      );

      if (!existingMember) {
        await groupRepository.addGroupMember(groupId, request.user_id);
      }
    }

    return updatedRequest;
  },

  async getGroupMembers(groupId: number) {
    const group = await groupRepository.findGroupById(groupId);

    if (!group) {
      throw new Error("Group not found");
    }

    return groupRepository.getGroupMembers(groupId);
  },

  async updateGroupMember(
    currentUserId: number,
    groupId: number,
    userId: number,
    data: {
      role?: string;
      status?: string;
    },
  ) {
    const group = await groupRepository.findGroupById(groupId);

    if (!group) {
      throw new Error("Group not found");
    }

    if (group.owner_id !== currentUserId) {
      throw new Error("Only group owner can update members");
    }

    const membership = await groupRepository.findMembership(groupId, userId);

    if (!membership) {
      throw new Error("Member not found");
    }

    return groupRepository.updateGroupMember(groupId, userId, data);
  },

  async removeGroupMember(currentUserId: number, groupId: number, userId: number) {
    const group = await groupRepository.findGroupById(groupId);

    if (!group) {
      throw new Error("Group not found");
    }

    if (group.owner_id !== currentUserId && currentUserId !== userId) {
      throw new Error("Only group owner or the member can remove membership");
    }

    const membership = await groupRepository.findMembership(groupId, userId);

    if (!membership) {
      throw new Error("Member not found");
    }

    return groupRepository.removeGroupMember(groupId, userId);
  },

  async createChannel(
    currentUserId: number,
    groupId: number,
    data: {
      name: string;
      type: string;
      description?: string;
    },
  ) {
    const group = await groupRepository.findGroupById(groupId);

    if (!group) {
      throw new Error("Group not found");
    }

    if (group.owner_id !== currentUserId) {
      throw new Error("Only group owner can create channels");
    }
    if (!data.name?.trim()) {
      throw new Error("Channel name is required");
    }

    return groupRepository.createChannel(groupId, data);
  },

  async getGroupChannels(groupId: number) {
    const group = await groupRepository.findGroupById(groupId);

    if (!group) {
      throw new Error("Group not found");
    }

    return groupRepository.getGroupChannels(groupId);
  },

  async updateChannel(
    currentUserId: number,
    groupId: number,
    channelId: number,
    data: {
      name?: string;
      type?: string;
      description?: string;
    },
  ) {
    const group = await groupRepository.findGroupById(groupId);

    if (!group) {
      throw new Error("Group not found");
    }

    if (group.owner_id !== currentUserId) {
      throw new Error("Only group owner can update channels");
    }

    return groupRepository.updateChannel(channelId, data);
  },

  async deleteChannel(currentUserId: number, groupId: number, channelId: number) {
    const group = await groupRepository.findGroupById(groupId);

    if (!group) {
      throw new Error("Group not found");
    }

    if (group.owner_id !== currentUserId) {
      throw new Error("Only group owner can delete channels");
    }

    return groupRepository.deleteChannel(channelId);
  },
};

export default groupService;