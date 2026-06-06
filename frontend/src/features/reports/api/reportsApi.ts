import { api } from "@/lib/axios";

export type ReportsOverview = {
  users: number;
  posts: number;
  reactions: number;
  groups: number;
  messages: number;
  follows: number;
  courses: number;
};

export type ReportType = keyof ReportsOverview | "all";

type ReportsOverviewResponse = {
  success: boolean;
  data: ReportsOverview;
};

export const getReportsOverview = async (): Promise<ReportsOverview> => {
  const { data } = await api.get<ReportsOverviewResponse>("/reports/overview");

  return data.data;
};
