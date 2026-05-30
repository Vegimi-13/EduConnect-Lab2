import {
  BookOpen,
  Heart,
  MessageSquare,
  Repeat2,
  ScrollText,
  UsersRound,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { ReportsOverview } from "../types/admin.types";

type AdminMetricGridProps = {
  overview?: ReportsOverview;
  isLoading: boolean;
};

const metrics = [
  { key: "users", label: "Users", icon: UsersRound },
  { key: "posts", label: "Posts", icon: ScrollText },
  { key: "groups", label: "Groups", icon: UsersRound },
  { key: "messages", label: "Messages", icon: MessageSquare },
  { key: "reactions", label: "Reactions", icon: Heart },
  { key: "follows", label: "Follows", icon: Repeat2 },
  { key: "courses", label: "Courses", icon: BookOpen },
] as const;

export function AdminMetricGrid({
  overview,
  isLoading,
}: AdminMetricGridProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const value = overview?.[metric.key] ?? 0;

        return (
          <Card key={metric.key} className="border-[#b8c4c7] bg-white">
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm font-medium text-[#4b5563]">
                  {metric.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-[#061f22]">
                  {isLoading ? "..." : value.toLocaleString()}
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-md bg-[#edf3fb] text-[#073f43]">
                <Icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
