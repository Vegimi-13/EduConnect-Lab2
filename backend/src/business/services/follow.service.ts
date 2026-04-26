import followRepository from "../../persistence/repositories/follow.repository";

const followService = {
  async sendFollowRequest(currentUserId: number, targetUserId: number) {
    if (currentUserId === targetUserId) {
      throw new Error("You cannot send a follow request to yourself");
    }

    const targetUser = await followRepository.findUserWithProfile(targetUserId);

    if (!targetUser) {
      throw new Error("User not found");
    }

    const existingFollow = await followRepository.findFollow(
      currentUserId,
      targetUserId,
    );

    if (existingFollow) {
      throw new Error(
        `Follow request already exists with status: ${existingFollow.status}`,
      );
    }

    // 🔥 CHECK VISIBILITY
    const status =
      targetUser.profile?.visibility === "public"
        ? "accepted"
        : "pending";

    return followRepository.createFollowRequest(
      currentUserId,
      targetUserId,
      status,
    );
  },

  async removeFollow(currentUserId: number, targetUserId: number) {
    const existingFollow = await followRepository.findFollow(
      currentUserId,
      targetUserId,
    );

    if (!existingFollow) {
      throw new Error("Follow connection/request not found");
    }

    return followRepository.deleteFollow(currentUserId, targetUserId);
  },

  async acceptFollowRequest(currentUserId: number, requesterId: number) {
    const existingFollow = await followRepository.findFollow(
      requesterId,
      currentUserId,
    );

    if (!existingFollow) {
      throw new Error("Follow request not found");
    }

    if (existingFollow.status !== "pending") {
      throw new Error(`Request is already ${existingFollow.status}`);
    }

    return followRepository.updateStatus(requesterId, currentUserId, "accepted");
  },

  async rejectFollowRequest(currentUserId: number, requesterId: number) {
    const existingFollow = await followRepository.findFollow(
      requesterId,
      currentUserId,
    );

    if (!existingFollow) {
      throw new Error("Follow request not found");
    }

    if (existingFollow.status !== "pending") {
      throw new Error(`Request is already ${existingFollow.status}`);
    }

    return followRepository.updateStatus(requesterId, currentUserId, "rejected");
  },

  async getFollowers(userId: number) {
    return followRepository.getFollowers(userId);
  },

  async getFollowing(userId: number) {
    return followRepository.getFollowing(userId);
  },

  async getPendingRequests(currentUserId: number) {
    return followRepository.getPendingRequests(currentUserId);
  },
};

export default followService;