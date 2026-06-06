import { api } from "@/lib/axios";

export type SearchUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
};

async function searchUsers(query?: { q?: string; page?: number; limit?: number }) {
  const { data } = await api.get<SearchUser[]>("/search/users", {
    params: query,
  });
  return data;
}

export const searchApi = {
  searchUsers,
};
