import { Activity, Database, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

type AdminSystemPanelProps = {
  rolesCount: number;
  permissionsCount: number;
};

export function AdminSystemPanel({
  rolesCount,
  permissionsCount,
}: AdminSystemPanelProps) {
  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardHeader className="p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Activity className="size-5" />
          Admin Health
        </h2>
      </CardHeader>
      <CardContent className="space-y-3 px-5 pb-5">
        <div className="flex items-center justify-between rounded-md bg-[#f8fafc] px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="size-4 text-[#073f43]" />
            Roles
          </span>
          <span className="font-bold text-[#061f22]">{rolesCount}</span>
        </div>
        <div className="flex items-center justify-between rounded-md bg-[#f8fafc] px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Database className="size-4 text-[#073f43]" />
            Permissions
          </span>
          <span className="font-bold text-[#061f22]">{permissionsCount}</span>
        </div>
      </CardContent>
    </Card>
  );
}
