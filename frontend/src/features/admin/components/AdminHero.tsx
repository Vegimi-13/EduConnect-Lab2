import { FileBarChart, History, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              className="h-10 shrink-0 bg-[#ffc85c] px-4 text-sm font-semibold text-[#5f4308] hover:bg-[#f3bb4a]"
            >
              <Link to="/reports">
                <FileBarChart className="size-4" />
                Generate report
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-10 shrink-0 border-white/25 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/18"
            >
              <Link to="/admin/logs">
                <History className="size-4" />
                View logs
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
