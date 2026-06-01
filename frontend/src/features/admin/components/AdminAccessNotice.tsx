import { LockKeyhole } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type AdminAccessNoticeProps = {
  message: string;
};

export function AdminAccessNotice({ message }: AdminAccessNoticeProps) {
  return (
    <Card className="border-[#f0c2c2] bg-[#fff7f7]">
      <CardContent className="flex items-start gap-3 p-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#ffe3e3] text-[#8a1f1f]">
          <LockKeyhole className="size-4" />
        </div>
        <div>
          <h2 className="font-semibold text-[#431111]">Admin access needed</h2>
          <p className="mt-1 text-sm leading-6 text-[#6f3838]">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
