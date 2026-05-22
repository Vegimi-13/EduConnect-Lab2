import { ReportsSummaryCards } from "../components/ReportsSummaryCards";
import { ReportsFilters } from "../components/ReportsFilters";
import { ReportsTable } from "../components/ReportsTable";
import { ReportsCharts } from "../components/ReportsCharts";

export const ReportsPage = () => {
  return (
    <main className="min-h-screen bg-[#eef4fb] p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl bg-teal-900 p-6 text-white shadow-sm">
          <p className="text-sm font-semibold text-teal-100">
            Admin analytics
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Dynamic Reports Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-teal-50">
            Overview of platform activity across users, posts, reactions,
            groups, messages, follows, and courses.
          </p>
        </section>

        <ReportsSummaryCards />
        <ReportsFilters />
        <ReportsCharts />
        <ReportsTable />
      </div>
    </main>
  );
};