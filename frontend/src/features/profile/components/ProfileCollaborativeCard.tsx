import { UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ProfileCollaborativeCard() {
  return (
    <Card className="overflow-hidden border-[#b8c4c7] bg-white">
      <CardContent className="relative p-6">
        <div className="absolute -right-8 -top-8 size-28 rounded-full border-[12px] border-[#d9dde4]" />
        <div className="relative border-l-4 border-[#0b5557] pl-6">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <UsersRound className="size-4" />
            Collaborative Space
          </h2>
          <p className="mt-2 max-w-[13rem] text-xs font-medium leading-5">
            Keep this area as a launch point for groups, labs, or shared study
            spaces once the rest of the frontend is ready.
          </p>
          <Button className="mt-5 w-full bg-[#073f43] text-white hover:bg-[#062f33]">
            View Groups
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
