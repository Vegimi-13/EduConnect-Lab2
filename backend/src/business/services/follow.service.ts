import followRepository from "../../persistence/repositories/follow.repository";
import notificationService from "./notification.service";

function fullName(user: { first_name: string; last_name: string }) {
  return `${user.first_name} ${user.last_name}`;
}

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

    const status = "pending";

    const follow = await followRepository.createFollowRequest(
      currentUserId,
      targetUserId,
      status,
    );

    const follower = await followRepository.findUserById(currentUserId);
    const actorName = follower ? fullName(follower) : "Someone";

    await notificationService.notify({
      user_id: targetUserId,
      sender_id: currentUserId,
      type: "FOLLOW_REQUEST",
      title: "New follow request",
      message: `${actorName} requested to follow you.`,
    });

    return follow;
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

    const follow = await followRepository.updateStatus(requesterId, currentUserId, "accepted");
    const currentUser = await followRepository.findUserById(currentUserId);
    const actorName = currentUser ? fullName(currentUser) : "Someone";

    await notificationService.notify({
      user_id: requesterId,
      sender_id: currentUserId,
      type: "FOLLOW_ACCEPTED",
      title: "Follow request accepted",
      message: `${actorName} accepted your follow request.`,
    });

    return follow;
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

  async getFollowStatus(
    currentUserId: number,
    targetUserId: number,
  ): Promise<{ status: "not_following" | "pending" | "following" }> {
    const follow = await followRepository.findFollow(currentUserId, targetUserId);
 
    if (!follow) return { status: "not_following" };
    if (follow.status === "accepted") return { status: "following" };
    return { status: "pending" };
  },
};

export default followService;
