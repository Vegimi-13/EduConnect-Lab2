import { ChevronLeft, ChevronRight, History } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AdminAuditLog } from "../types/admin.types";

type AdminAuditLogsPanelProps = {
  logs: AdminAuditLog[];
  isLoading: boolean;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
};

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

export function AdminAuditLogsPanel({
  logs,
  isLoading,
  pagination,
  onPageChange,
}: AdminAuditLogsPanelProps) {
  const hasPreviousPage = Boolean(pagination && pagination.page > 1);
  const hasNextPage = Boolean(
    pagination && pagination.page < pagination.totalPages
  );

  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardHeader className="flex flex-row items-center justify-between gap-4 p-5">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <History className="size-5" />
            Audit Logs
          </h2>
          {pagination ? (
            <p className="mt-1 text-xs text-[#4b5563]">
              {pagination.total > 0
                ? `Showing ${(pagination.page - 1) * pagination.limit + 1}-${Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )} of ${pagination.total}`
                : "No logs recorded yet"}
            </p>
          ) : null}
        </div>

        {pagination && onPageChange ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#4b5563]">
              Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={!hasPreviousPage || isLoading}
              onClick={() => onPageChange(pagination.page - 1)}
              aria-label="Previous audit log page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={!hasNextPage || isLoading}
              onClick={() => onPageChange(pagination.page + 1)}
              aria-label="Next audit log page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3 px-5 pb-5">
        {isLoading ? (
          <p className="text-sm text-[#4b5563]">Loading logs...</p>
        ) : null}

        {!isLoading && !logs.length ? (
          <p className="text-sm text-[#4b5563]">No audit logs available.</p>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f8fafc] text-[#061f22]">
              <tr>
                <th className="px-4 py-2 font-semibold">Date</th>
                <th className="px-4 py-2 font-semibold">User</th>
                <th className="px-4 py-2 font-semibold">Action</th>
                <th className="px-4 py-2 font-semibold">Entity</th>
                <th className="px-4 py-2 font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d6dde3]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#f1f5f9]">
                  <td className="px-4 py-2 text-[#4b5563]">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-4 py-2">
                    <div className="font-medium text-[#061f22]">
                      {getUserDisplayName(log)}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center rounded-md bg-[#edf3fb] px-2 py-1 text-xs font-semibold capitalize text-[#073f43]">
                      {formatAction(log.action)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-[#4b5563]">
                    {log.entity} (#{log.entity_id})
                  </td>
                  <td className="px-4 py-2 text-[#4b5563]">
                    {log.ip_address || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
