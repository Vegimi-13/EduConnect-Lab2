import { Info } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { StudentProfile } from "../types/profile.types";

type ProfileAboutCardProps = {
  profile: StudentProfile;
};

export function ProfileAboutCard({ profile }: ProfileAboutCardProps) {
  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardHeader className="p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Info className="size-5" />
          About
        </h2>
      </CardHeader>
      <CardContent className="px-5 pb-6">
        <p className="text-sm leading-7 text-[#1f2937]">
          {profile.bio?.trim() ||
            "Add a short introduction so other students can understand your interests, goals, and what you are currently working on."}
        </p>
      </CardContent>
    </Card>
  );
}
