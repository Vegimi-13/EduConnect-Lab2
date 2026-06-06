import type { ReportsOverview, ReportType } from "../api/reportsApi";

type ReportsChartsProps = {
  reports?: ReportsOverview;
  isLoading: boolean;
  reportType: ReportType;
};

function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export const ReportsCharts = ({
  reports,
  isLoading,
  reportType,
}: ReportsChartsProps) => {
  const allActivityData = [
    { label: "Users", value: reports?.users ?? 0 },
    { label: "Posts", value: reports?.posts ?? 0 },
    { label: "Reactions", value: reports?.reactions ?? 0 },
    { label: "Groups", value: reports?.groups ?? 0 },
    { label: "Messages", value: reports?.messages ?? 0 },
    { label: "Follows", value: reports?.follows ?? 0 },
    { label: "Courses", value: reports?.courses ?? 0 },
  ];
  const activityData =
    reportType === "all"
      ? allActivityData
      : allActivityData.filter(
          (item) => item.label.toLowerCase() === reportType
        );
  const maxActivity = Math.max(...activityData.map((item) => item.value), 1);
  const engagementData = [
    { label: "Reactions", value: reports?.reactions ?? 0 },
    { label: "Messages", value: reports?.messages ?? 0 },
    { label: "Follows", value: reports?.follows ?? 0 },
  ];
  const visibleEngagementData =
    reportType === "all"
      ? engagementData
      : engagementData.filter((item) => item.label.toLowerCase() === reportType);
  const engagementTotal = visibleEngagementData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Platform Volume</h2>
        <p className="text-sm text-slate-500">Current totals by entity</p>

        <div className="mt-6 flex h-56 items-end gap-4">
          {activityData.map((item) => (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-xl bg-teal-800"
                style={{
                  height: isLoading
                    ? "18%"
                    : `${Math.max(8, percent(item.value, maxActivity))}%`,
                }}
              />
              <span className="text-xs font-medium text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Percentage Mix</h2>
        <p className="text-sm text-slate-500">Dynamic share for engagement metrics</p>

        <div className="mt-6 space-y-4">
          {visibleEngagementData.length ? visibleEngagementData.map((item) => {
            const itemPercent = percent(item.value, engagementTotal);

            return (
              <div key={item.label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="font-semibold text-teal-800">
                    {isLoading ? "..." : `${itemPercent}%`}
                  </span>
                </div>

                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-teal-800"
                    style={{ width: isLoading ? "12%" : `${itemPercent}%` }}
                  />
                </div>
              </div>
            );
          }) : (
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              No engagement percentage for this report type.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
