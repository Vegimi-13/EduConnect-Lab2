import { History } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { AdminAuditLog } from "../types/admin.types";

type AdminAuditLogsPanelProps = {
  logs: AdminAuditLog[];
  isLoading: boolean;
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
}: AdminAuditLogsPanelProps) {
  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardHeader className="p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <History className="size-5" />
          Audit Logs
        </h2>
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
