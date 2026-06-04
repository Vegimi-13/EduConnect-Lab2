import { isAxiosError } from "axios";

import { api } from "@/lib/axios";
import type {
  CreateGroupChannelRequest,
  CreateGroupRequest,
  ExploreGroup,
  Group,
  GroupApiErrorResponse,
  GroupApiResponse,
  GroupChannel,
  GroupMember,
  GroupMembership,
} from "../types/groups.types";

function createGroupsApiError(message: string, status?: number) {
  return {
    name: "GroupsApiError",
    message,
    status,
  };
}

function toGroupsApiError(error: unknown) {
  if (isAxiosError<GroupApiErrorResponse>(error)) {
    return createGroupsApiError(
      error.response?.data?.message ?? error.message ?? "Groups request failed",
      error.response?.status
    );
  }

  if (error instanceof Error) {
    return createGroupsApiError(error.message);
  }

  return createGroupsApiError("Groups request failed");
}

function toQueryParams(query?: { q?: string; page?: number; limit?: number }) {
  const params = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  return params;
}

async function requestGroups<T>(request: Promise<{ data: T }>) {
  try {
    const { data } = await request;
    return data;
  } catch (error) {
    throw toGroupsApiError(error);
  }
}

async function getMyGroups() {
  const response = await requestGroups(
    api.get<GroupApiResponse<GroupMembership[]>>("/groups/my")
  );

  return response.data;
}

async function createGroup(payload: CreateGroupRequest) {
  const response = await requestGroups(
    api.post<GroupApiResponse<Group>>("/groups", payload)
  );

  return response.data;
}

async function searchGroups(query?: { q?: string; page?: number; limit?: number }) {
  return requestGroups(
    api.get<ExploreGroup[]>("/search/groups", {
      params: toQueryParams(query),
    })
  );
}

async function joinGroup(groupId: number) {
  const response = await requestGroups(
    api.post<GroupApiResponse<GroupMembership>>(`/groups/${groupId}/join`)
  );

  return response.data;
}

async function getGroupMembers(groupId: number) {
  const response = await requestGroups(
    api.get<GroupApiResponse<GroupMember[]>>(`/groups/${groupId}/members`)
  );

  return response.data;
}

async function getGroupChannels(groupId: number) {
  const response = await requestGroups(
    api.get<GroupApiResponse<GroupChannel[]>>(`/groups/${groupId}/channels`)
  );

  return response.data;
}

async function createGroupChannel(
  groupId: number,
  payload: CreateGroupChannelRequest
) {
  const response = await requestGroups(
    api.post<GroupApiResponse<GroupChannel>>(`/groups/${groupId}/channels`, payload)
  );

  return response.data;
}

export const groupsApi = {
  getMyGroups,
  createGroup,
  searchGroups,
  joinGroup,
  getGroupMembers,
  getGroupChannels,
  createGroupChannel,
};
