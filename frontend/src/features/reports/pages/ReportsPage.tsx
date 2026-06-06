import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { ReportsSummaryCards } from "../components/ReportsSummaryCards";
import { ReportsFilters } from "../components/ReportsFilters";
import { ReportsTable } from "../components/ReportsTable";
import { ReportsCharts } from "../components/ReportsCharts";
import { getReportsOverview, type ReportType } from "../api/reportsApi";

export const ReportsPage = () => {
  const [reportType, setReportType] = useState<ReportType>("all");
  const reportsQuery = useQuery({
    queryKey: ["reports", "overview"],
    queryFn: getReportsOverview,
  });

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

        {reportsQuery.error ? (
          <section className="rounded-md border border-destructive/20 bg-white p-4 text-sm text-destructive">
            Could not load reports overview.
          </section>
        ) : null}

        <ReportsSummaryCards
          reports={reportsQuery.data}
          isLoading={reportsQuery.isLoading}
        />
        <ReportsFilters
          reportType={reportType}
          onReportTypeChange={setReportType}
        />
        <ReportsCharts
          reports={reportsQuery.data}
          isLoading={reportsQuery.isLoading}
          reportType={reportType}
        />
        <ReportsTable
          reports={reportsQuery.data}
          isLoading={reportsQuery.isLoading}
          reportType={reportType}
        />
      </div>
    </main>
  );
};
