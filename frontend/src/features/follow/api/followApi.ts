import { api } from "@/lib/axios";

export type FollowStatus = "not_following" | "pending" | "following";

export type FollowStatusResponse = {
  status: FollowStatus;
};

type FollowRecord = {
  follower_id: number;
  following_id: number;
  status: "pending" | "accepted" | "rejected";
};

type FollowMutationResponse = {
  message: string;
  data: FollowRecord;
};

async function followUser(userId: number): Promise<FollowMutationResponse> {
  const { data } = await api.post(`/follow/${userId}`);
  return data;
}

async function unfollowUser(userId: number): Promise<{ message: string }> {
  const { data } = await api.delete(`/follow/${userId}`);
  return data;
}

async function getFollowStatus(userId: number): Promise<FollowStatusResponse> {
  const { data } = await api.get<FollowStatusResponse>(`/follow/status/${userId}`);
  return data;
}

export const followApi = {
  followUser,
  unfollowUser,
  getFollowStatus,
};
