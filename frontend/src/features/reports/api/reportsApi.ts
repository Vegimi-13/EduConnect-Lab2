export type ReportsOverview = {
  users: number;
  posts: number;
  reactions: number;
  groups: number;
  messages: number;
  follows: number;
  courses: number;
};

type ReportsOverviewResponse = {
  success: boolean;
  data: ReportsOverview;
};

export const getReportsOverview = async (): Promise<ReportsOverview> => {
  const response = await fetch("http://localhost:5000/api/reports/overview", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch reports overview");
  }

  const result = (await response.json()) as ReportsOverviewResponse;

  return result.data;
};