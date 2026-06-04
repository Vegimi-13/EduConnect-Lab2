import { api } from "@/lib/axios";

export type FollowStatus = "not_following" | "pending" | "following";

export type FollowStatusResponse = {
  status: FollowStatus;
};

async function followUser(userId: number): Promise<{ message: string }> {
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
