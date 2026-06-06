import type { ReportsOverview } from "../api/reportsApi";

type ReportsSummaryCardsProps = {
  reports?: ReportsOverview;
  isLoading: boolean;
};

function percentage(value: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

export const ReportsSummaryCards = ({
  reports,
  isLoading,
}: ReportsSummaryCardsProps) => {
  const total = Object.values(reports ?? {}).reduce((sum, value) => sum + value, 0);
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
            {isLoading ? "..." : item.value.toLocaleString()}
          </h3>
          <p className="mt-2 text-xs font-medium text-slate-500">
            {isLoading ? "..." : `${percentage(item.value, total)} of total activity`}
          </p>
        </div>
      ))}
    </section>
  );
};
