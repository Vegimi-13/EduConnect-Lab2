import { Edit3, ExternalLink, MapPin, Share2, UserCheck, UserPlus, Clock } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { followApi } from "@/features/follow/api/followApi";
import type { StudentProfile } from "../types/profile.types";
import {
  getProfileHeadline,
  getProfileInitials,
  getProfileName,
} from "./profileFormatters";

type ProfileHeroProps = {
  profile: StudentProfile;
  onEdit?: () => void;
  isOwnProfile?: boolean;
};

function CoverVisual() {
  return (
    <div className="relative z-0 h-54 overflow-hidden rounded-t-md bg-[#0b5557]">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,50,52,0.96),rgba(14,115,116,0.76)),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.18))]" />
      <div className="absolute inset-y-0 left-10 w-40 border-x border-white/10" />
      <div className="absolute inset-y-0 left-28 w-px bg-white/12" />
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-white/8" />
      <div className="absolute right-10 top-0 h-full w-56 border-x border-white/15" />
      <div className="absolute right-28 top-0 h-full w-px bg-white/20" />
      <div className="absolute left-16 top-10 grid grid-cols-4 gap-2 opacity-35">
        {Array.from({ length: 28 }).map((_, index) => (
          <span key={index} className="h-8 w-5 rounded-sm bg-white/30" />
        ))}
      </div>
    </div>
  );
}

function ProfileAvatar({ label }: { label: string }) {
  return (
    <div className="flex size-28 shrink-0 items-center justify-center rounded-md border-8 border-white bg-[#0b5557] text-3xl font-bold text-white shadow-lg">
      {label}
    </div>
  );
}

function FollowButton({ userId, profileVisibility }: { userId: number; profileVisibility?: string | null }) {
  const queryClient = useQueryClient();
  const queryKey = ["follow", "status", userId];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => followApi.getFollowStatus(userId),
    retry: false,
  });

  const followMutation = useMutation({
    mutationFn: () => followApi.followUser(userId),
    onSuccess: (response) => {
      const newStatus =
        response.data.status === "accepted" ? "following" : "pending";
      queryClient.setQueryData(queryKey, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ["follow", "followers", userId] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => followApi.unfollowUser(userId),
    onSuccess: () => {
      queryClient.setQueryData(queryKey, { status: "not_following" });
      queryClient.invalidateQueries({ queryKey: ["follow", "followers", userId] });
    },
  });

  const isPending = followMutation.isPending || unfollowMutation.isPending || isLoading;
  const status = data?.status ?? "not_following";

  if (status === "following") {
    return (
      <Button
        variant="outline"
        className="h-11 gap-2 px-5 border-[#073f43] text-[#073f43] hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
        disabled={isPending}
        onClick={() => unfollowMutation.mutate()}
      >
        <UserCheck className="size-4" />
        Following
      </Button>
    );
  }

  if (status === "pending") {
    return (
      <Button
        variant="outline"
        className="h-11 gap-2 px-5 border-amber-400 text-amber-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
        disabled={isPending}
        onClick={() => unfollowMutation.mutate()}
      >
        <Clock className="size-4" />
        Requested
      </Button>
    );
  }

  return (
    <Button
      className="h-11 gap-2 bg-[#073f43] px-5 text-white hover:bg-[#062f33]"
      disabled={isPending}
      onClick={() => followMutation.mutate()}
    >
      <UserPlus className="size-4" />
      {profileVisibility === "private" ? "Request to Follow" : "Follow"}
    </Button>
  );
}

export function ProfileHero({ profile, onEdit, isOwnProfile = false }: ProfileHeroProps) {
  const website = profile.website_url?.trim();

  return (
    <Card className="overflow-hidden border-[#b8c4c7] bg-white">
      <CoverVisual />
      <CardContent className="relative z-10 px-8 pb-7 pt-2">
        <div className="-mt-11 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <ProfileAvatar label={getProfileInitials(profile)} />
            <div className="pb-3">
              <h1 className="text-3xl font-bold text-[#061f22]">
                {getProfileName(profile)}
              </h1>
              <p className="mt-1 max-w-xl text-lg font-medium text-[#111827]">
                {getProfileHeadline(profile)}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#4b5563]">
                {profile.location ? (
                  <p className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    {profile.location}
                  </p>
                ) : null}
                {website ? (
                  <a
                    href={website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 font-medium text-[#073f43]"
                  >
                    <ExternalLink className="size-4" />
                    Website
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pb-3">
            <Button variant="outline" className="h-11 px-5">
              <Share2 className="size-4" />
              Share
            </Button>
            {isOwnProfile && onEdit ? (
              <Button
                className="h-11 bg-[#073f43] px-5 text-white hover:bg-[#062f33]"
                onClick={onEdit}
              >
                <Edit3 className="size-4" />
                Edit Profile
              </Button>
            ) : null}
            {!isOwnProfile ? (
              <FollowButton
                userId={profile.user_id}
                profileVisibility={profile.visibility}
              />
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid rounded-md border border-[#c8d1d7] bg-[#edf3fb] py-4 text-center sm:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em]">
              Skills
            </p>
            <p className="mt-1 text-lg font-bold text-[#061f22]">
              {profile.skills.length}
            </p>
          </div>
          <div className="border-t border-[#c8d1d7] pt-4 sm:border-l sm:border-t-0 sm:pt-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em]">
              Education
            </p>
            <p className="mt-1 text-lg font-bold text-[#061f22]">
              {profile.education.length}
            </p>
          </div>
          <div className="border-t border-[#c8d1d7] pt-4 sm:border-l sm:border-t-0 sm:pt-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em]">
              Courses
            </p>
            <p className="mt-1 text-lg font-bold text-[#061f22]">
              {profile.courses.length}
            </p>
          </div>
          <div className="border-t border-[#c8d1d7] pt-4 sm:border-l sm:border-t-0 sm:pt-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em]">
              Visibility
            </p>
            <p className="mt-1 text-sm font-bold capitalize text-[#061f22]">
              {profile.visibility ?? "public"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
