import type { ReportType } from "../api/reportsApi";

type ReportsFiltersProps = {
  reportType: ReportType;
  onReportTypeChange: (reportType: ReportType) => void;
};

const reportTypes: Array<{ label: string; value: ReportType }> = [
  { label: "All Reports", value: "all" },
  { label: "Users", value: "users" },
  { label: "Posts", value: "posts" },
  { label: "Reactions", value: "reactions" },
  { label: "Groups", value: "groups" },
  { label: "Messages", value: "messages" },
  { label: "Follows", value: "follows" },
  { label: "Courses", value: "courses" },
];

export const ReportsFilters = ({
  reportType,
  onReportTypeChange,
}: ReportsFiltersProps) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Report Type
          </label>

          <select
            className="w-full rounded-xl border border-slate-300 p-3 outline-none"
            value={reportType}
            onChange={(event) =>
              onReportTypeChange(event.target.value as ReportType)
            }
          >
            {reportTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Generated
          </label>

          <div className="rounded-xl border border-slate-300 p-3 text-sm text-slate-700">
            {new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date())}
          </div>
        </div>
      </div>
    </section>
  );
};
