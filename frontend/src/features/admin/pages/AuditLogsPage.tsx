import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, History, Search } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminApi } from "../api/adminApi";
import type { AdminAuditLog } from "../types/admin.types";

function formatAction(action: string) {
  return action.replace(/_/g, " ").toLowerCase();
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function getUserDisplayName(log: AdminAuditLog) {
  if (!log.user) return "System";
  return `${log.user.first_name} ${log.user.last_name}`.trim() || log.user.email;
}

export function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [query, setQuery] = useState("");

  const logsQuery = useQuery({
    queryKey: ["admin", "audit-logs", "page", page, limit],
    queryFn: () => adminApi.getAuditLogs(page, limit),
  });

  const logs = logsQuery.data?.data ?? [];
  const meta = logsQuery.data?.meta;
  const filteredLogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return logs;

    return logs.filter((log) => {
      const searchable = [
        log.action,
        log.entity,
        String(log.entity_id),
        log.ip_address ?? "",
        getUserDisplayName(log),
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [logs, query]);
  const hasPreviousPage = Boolean(meta && meta.page > 1);
  const hasNextPage = Boolean(meta && meta.page < meta.totalPages);

  return (
    <AppShell activeItem="Admin">
      <div className="w-full space-y-5 py-5 pb-10">
        <section className="rounded-md bg-[#073f43] p-6 text-white shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#b9e2df]">
            <History className="size-4" />
            Admin audit
          </div>
          <h1 className="mt-2 text-3xl font-bold">Audit Logs</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#e4f3f1]">
            Review role, user, post, authentication, and system activity.
          </p>
        </section>

        <Card className="border-[#b8c4c7] bg-white">
          <CardHeader className="flex flex-col items-stretch gap-3 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Log Browser</h2>
              {meta ? (
                <p className="mt-1 text-xs text-[#4b5563]">
                  {meta.total > 0
                    ? `Page ${meta.page} of ${Math.max(meta.totalPages, 1)} · ${meta.total} total logs`
                    : "No logs recorded yet"}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative min-w-80">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#53676b]" />
                <Input
                  type="search"
                  className="h-9 border-[#b8c4c7] bg-[#edf3fb] pl-10"
                  placeholder="Filter current page"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <select
                className="h-9 rounded-md border border-[#b8c4c7] bg-white px-3 text-sm"
                value={limit}
                onChange={(event) => {
                  setPage(1);
                  setLimit(Number(event.target.value));
                }}
              >
                <option value={10}>10 rows</option>
                <option value={20}>20 rows</option>
                <option value={50}>50 rows</option>
              </select>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 px-5 pb-5">
            {logsQuery.isLoading ? (
              <p className="text-sm text-[#4b5563]">Loading logs...</p>
            ) : null}

            {logsQuery.error ? (
              <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                Could not load audit logs.
              </p>
            ) : null}

            {!logsQuery.isLoading && !filteredLogs.length ? (
              <p className="text-sm text-[#4b5563]">No logs match this view.</p>
            ) : null}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[70rem] table-fixed text-left text-sm">
                <colgroup>
                  <col className="w-[12rem]" />
                  <col className="w-[12rem]" />
                  <col className="w-[11rem]" />
                  <col className="w-[9rem]" />
                  <col className="w-[8rem]" />
                  <col />
                </colgroup>
                <thead className="bg-[#f8fafc] text-[#061f22]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                    <th className="px-4 py-3 font-semibold">Entity</th>
                    <th className="px-4 py-3 font-semibold">IP Address</th>
                    <th className="px-4 py-3 font-semibold">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d6dde3]">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#f1f5f9]">
                      <td className="whitespace-nowrap px-4 py-3 text-[#4b5563]">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#061f22]">
                          {getUserDisplayName(log)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-md bg-[#edf3fb] px-2 py-1 text-xs font-semibold capitalize text-[#073f43]">
                          {formatAction(log.action)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#4b5563]">
                        {log.entity} (#{log.entity_id})
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[#4b5563]">
                        {log.ip_address || "-"}
                      </td>
                      <td className="whitespace-normal break-words px-4 py-3 text-[#4b5563]">
                        {log.new_value || log.old_value || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta ? (
              <div className="flex items-center justify-end gap-2 border-t border-[#d6dde3] pt-3">
                <span className="mr-2 text-xs font-medium text-[#4b5563]">
                  Page {meta.page} of {Math.max(meta.totalPages, 1)}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={!hasPreviousPage || logsQuery.isLoading}
                  onClick={() => setPage(meta.page - 1)}
                  aria-label="Previous audit log page"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={!hasNextPage || logsQuery.isLoading}
                  onClick={() => setPage(meta.page + 1)}
                  aria-label="Next audit log page"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
