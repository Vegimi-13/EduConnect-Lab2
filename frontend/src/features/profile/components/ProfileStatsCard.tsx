import { Card, CardContent } from "@/components/ui/card";

type ProfileStatsCardProps = {
  followers: number;
  following: number;
};

export function ProfileStatsCard({
  followers,
  following,
}: ProfileStatsCardProps) {
  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardContent className="grid grid-cols-2 p-6 text-center">
        <div>
          <p className="text-xl font-bold">{followers}</p>
          <p className="text-xs font-semibold tracking-[0.08em]">Followers</p>
        </div>
        <div className="border-l border-[#c8d1d7]">
          <p className="text-xl font-bold">{following}</p>
          <p className="text-xs font-semibold tracking-[0.08em]">Following</p>
        </div>
      </CardContent>
    </Card>
  );
}
