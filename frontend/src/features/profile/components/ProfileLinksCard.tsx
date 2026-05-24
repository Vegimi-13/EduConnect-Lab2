import { ExternalLink, Globe, Link2, Shield } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { StudentProfile } from "../types/profile.types";

type ProfileLinksCardProps = {
  profile: StudentProfile;
};

export function ProfileLinksCard({ profile }: ProfileLinksCardProps) {
  const website = profile.website_url?.trim();
  const visibility = profile.visibility === "private" ? "Private" : "Public";

  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardHeader className="p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Link2 className="size-5" />
          Links
        </h2>
      </CardHeader>
      <CardContent className="space-y-5 px-5 pb-6">
        {website ? (
          <a
            href={website}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-4 text-left text-sm font-medium"
          >
            <span className="flex items-center gap-3">
              <Globe className="size-4" />
              Website
            </span>
            <ExternalLink className="size-3 text-[#4b5563]" />
          </a>
        ) : (
          <div className="text-sm text-[#4b5563]">
            Add a website in your profile editor to show a portfolio or academic
            page here.
          </div>
        )}

        <div className="flex items-center justify-between gap-4 text-sm font-medium">
          <span className="flex items-center gap-3">
            <Shield className="size-4" />
            Profile visibility
          </span>
          <span className="rounded-md bg-[#edf3fb] px-2 py-1 text-xs uppercase tracking-[0.08em] text-[#073f43]">
            {visibility}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
