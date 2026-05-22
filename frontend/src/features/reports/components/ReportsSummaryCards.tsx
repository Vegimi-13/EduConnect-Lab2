import { useEffect, useState } from "react";
import {
  getReportsOverview,
  type ReportsOverview,
} from "../api/reportsApi";

export const ReportsSummaryCards = () => {
  const [reports, setReports] = useState<ReportsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getReportsOverview();
        setReports(data);
      } catch (error) {
        console.error("Failed to load reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const summaryItems = [
    { label: "Users", value: reports?.users ?? 0 },
    { label: "Posts", value: reports?.posts ?? 0 },
    { label: "Reactions", value: reports?.reactions ?? 0 },
    { label: "Groups", value: reports?.groups ?? 0 },
    { label: "Messages", value: reports?.messages ?? 0 },
    { label: "Follows", value: reports?.follows ?? 0 },
    { label: "Courses", value: reports?.courses ?? 0 },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {summaryItems.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <p className="text-sm font-medium text-slate-500">
            {item.label}
          </p>

          <h3 className="mt-2 text-3xl font-bold text-slate-900">
            {loading ? "..." : item.value}
          </h3>
        </div>
      ))}
    </section>
  );
};