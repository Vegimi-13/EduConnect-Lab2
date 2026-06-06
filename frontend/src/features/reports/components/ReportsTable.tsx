import type { ReportsOverview, ReportType } from "../api/reportsApi";

type ReportsTableProps = {
  reports?: ReportsOverview;
  isLoading: boolean;
  reportType: ReportType;
};

function percent(value: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

export const ReportsTable = ({
  reports,
  isLoading,
  reportType,
}: ReportsTableProps) => {
  const total = Object.values(reports ?? {}).reduce((sum, value) => sum + value, 0);
  const allReportRows = [
    {
      category: "Users",
      metric: "Total registered users",
      value: reports?.users ?? 0,
    },
    {
      category: "Posts",
      metric: "Visible posts",
      value: reports?.posts ?? 0,
    },
    {
      category: "Groups",
      metric: "Academic groups",
      value: reports?.groups ?? 0,
    },
    {
      category: "Messages",
      metric: "Messages sent",
      value: reports?.messages ?? 0,
    },
    {
      category: "Reactions",
      metric: "Total reactions",
      value: reports?.reactions ?? 0,
    },
    {
      category: "Follows",
      metric: "Follow connections and requests",
      value: reports?.follows ?? 0,
    },
    {
      category: "Courses",
      metric: "Courses in catalog",
      value: reports?.courses ?? 0,
    },
  ];
  const reportRows =
    reportType === "all"
      ? allReportRows
      : allReportRows.filter((row) => row.category.toLowerCase() === reportType);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900">
          Platform Activity
        </h2>

        <p className="text-sm text-slate-500">
          Dynamic analytics overview across platform entities.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="pb-3 text-sm font-semibold text-slate-600">
                Category
              </th>

              <th className="pb-3 text-sm font-semibold text-slate-600">
                Metric
              </th>

              <th className="pb-3 text-sm font-semibold text-slate-600">
                Value
              </th>

              <th className="pb-3 text-sm font-semibold text-slate-600">
                Share
              </th>
            </tr>
          </thead>

          <tbody>
            {reportRows.map((row) => (
              <tr
                key={row.metric}
                className="border-b border-slate-100"
              >
                <td className="py-4 text-sm text-slate-700">
                  {row.category}
                </td>

                <td className="py-4 text-sm text-slate-700">
                  {row.metric}
                </td>

                <td className="py-4 text-sm font-semibold text-slate-900">
                  {isLoading ? "..." : row.value.toLocaleString()}
                </td>

                <td className="py-4 text-sm font-semibold text-teal-800">
                  {isLoading ? "..." : percent(row.value, total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
