import { ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function AdminHero() {
  return (
    <Card className="border-[#b8c4c7] bg-[#073f43] text-white">
      <CardContent className="p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#b9e2df]">
              <ShieldCheck className="size-4" />
              Platform admin
            </div>
            <h1 className="mt-2 text-3xl font-bold">Admin Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#e4f3f1]">
              Monitor core platform activity and manage role access from one
              focused workspace.
            </p>
          </div>

          <div className="rounded-md border border-white/20 bg-white/10 px-4 py-3 text-sm">
            <p className="font-semibold">Backend surfaces</p>
            <p className="mt-1 text-[#d7ecea]">Reports, roles, permissions, users</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
