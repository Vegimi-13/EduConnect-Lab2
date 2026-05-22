import { ReportsSummaryCards } from "../components/ReportsSummaryCards";
import { ReportsFilters } from "../components/ReportsFilters";
import { ReportsTable } from "../components/ReportsTable";
export const ReportsPage = () => {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Admin analytics
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            Dynamic Reports Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Overview of platform activity across users, posts, reactions,
            groups, messages, follows, and courses.
          </p>
        </div>

        <ReportsSummaryCards />
        <ReportsFilters />
        <ReportsTable />
      </div>
    </main>
  );
};