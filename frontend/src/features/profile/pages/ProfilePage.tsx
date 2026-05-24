import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/AppShell";
import { profileApi } from "../api/profileApi";
import { ProfileAboutCard } from "../components/ProfileAboutCard";
import { ProfileCollaborativeCard } from "../components/ProfileCollaborativeCard";
import { ProfileCoursesCard } from "../components/ProfileCoursesCard";
import { ProfileEditPanel } from "../components/ProfileEditPanel";
import { ProfileEducationCard } from "../components/ProfileEducationCard";
import { ProfileHero } from "../components/ProfileHero";
import { ProfileLinksCard } from "../components/ProfileLinksCard";
import { ProfileSkillsCard } from "../components/ProfileSkillsCard";
import { ProfileStatsCard } from "../components/ProfileStatsCard";
import type {
  AddCourseRequest,
  CreateEducationRequest,
  UpdateEducationRequest,
  UpdateProfileRequest,
} from "../types/profile.types";

const profileQueryKey = ["profile", "me"];
const institutionsQueryKey = ["profile", "institutions"];
const fieldsQueryKey = ["profile", "fields"];
const coursesQueryKey = ["profile", "courses"];

function ProfilePageSkeleton() {
  return (
    <AppShell activeItem="Profile">
      <div className="mx-auto max-w-[56rem] space-y-5">
        <div className="h-80 animate-pulse rounded-md bg-white/80" />
        <div className="h-36 animate-pulse rounded-md bg-white/80" />
        <div className="h-64 animate-pulse rounded-md bg-white/80" />
      </div>
    </AppShell>
  );
}

function ProfilePageError({ message }: { message: string }) {
  return (
    <AppShell activeItem="Profile">
      <div className="mx-auto max-w-[56rem] rounded-md border border-destructive/20 bg-white p-6">
        <h1 className="text-xl font-bold text-[#061f22]">Profile unavailable</h1>
        <p className="mt-2 text-sm text-[#4b5563]">{message}</p>
      </div>
    </AppShell>
  );
}

export function ProfilePage() {
  const queryClient = useQueryClient();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [skillsError, setSkillsError] = useState<string | null>(null);
  const [educationError, setEducationError] = useState<string | null>(null);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: profileQueryKey,
    queryFn: profileApi.getMyProfile,
  });

  const institutionsQuery = useQuery({
    queryKey: institutionsQueryKey,
    queryFn: profileApi.getInstitutions,
  });

  const fieldsQuery = useQuery({
    queryKey: fieldsQueryKey,
    queryFn: profileApi.getFields,
  });

  const courseCatalogQuery = useQuery({
    queryKey: coursesQueryKey,
    queryFn: profileApi.getCourses,
  });

  const followersQuery = useQuery({
    queryKey: ["follow", "followers", profileQuery.data?.user_id],
    queryFn: () => profileApi.getFollowers(profileQuery.data!.user_id),
    enabled: Boolean(profileQuery.data?.user_id),
  });

  const followingQuery = useQuery({
    queryKey: ["follow", "following", profileQuery.data?.user_id],
    queryFn: () => profileApi.getFollowing(profileQuery.data!.user_id),
    enabled: Boolean(profileQuery.data?.user_id),
  });

  async function refreshProfile() {
    await queryClient.invalidateQueries({ queryKey: profileQueryKey });
  }

  const updateProfileMutation = useMutation({
    mutationFn: (payload: UpdateProfileRequest) => profileApi.updateMyProfile(payload),
    onSuccess: async () => {
      setProfileError(null);
      setIsEditingProfile(false);
      await refreshProfile();
    },
    onError: (error: Error) => {
      setProfileError(error.message);
    },
  });

  const addSkillMutation = useMutation({
    mutationFn: (name: string) => profileApi.addSkill({ name }),
    onSuccess: async () => {
      setSkillsError(null);
      await refreshProfile();
    },
    onError: (error: Error) => {
      setSkillsError(error.message);
    },
  });

  const removeSkillMutation = useMutation({
    mutationFn: (skillId: number) => profileApi.removeSkill(skillId),
    onSuccess: async () => {
      setSkillsError(null);
      await refreshProfile();
    },
    onError: (error: Error) => {
      setSkillsError(error.message);
    },
  });

  const addEducationMutation = useMutation({
    mutationFn: (payload: CreateEducationRequest) => profileApi.addEducation(payload),
    onSuccess: async () => {
      setEducationError(null);
      await refreshProfile();
    },
    onError: (error: Error) => {
      setEducationError(error.message);
    },
  });

  const updateEducationMutation = useMutation({
    mutationFn: ({
      educationId,
      payload,
    }: {
      educationId: number;
      payload: UpdateEducationRequest;
    }) => profileApi.updateEducation(educationId, payload),
    onSuccess: async () => {
      setEducationError(null);
      await refreshProfile();
    },
    onError: (error: Error) => {
      setEducationError(error.message);
    },
  });

  const deleteEducationMutation = useMutation({
    mutationFn: (educationId: number) => profileApi.deleteEducation(educationId),
    onSuccess: async () => {
      setEducationError(null);
      await refreshProfile();
    },
    onError: (error: Error) => {
      setEducationError(error.message);
    },
  });

  const addCourseMutation = useMutation({
    mutationFn: (payload: AddCourseRequest) => profileApi.addCourse(payload),
    onSuccess: async () => {
      setCoursesError(null);
      await refreshProfile();
    },
    onError: (error: Error) => {
      setCoursesError(error.message);
    },
  });

  const removeCourseMutation = useMutation({
    mutationFn: (courseId: number) => profileApi.removeCourse(courseId),
    onSuccess: async () => {
      setCoursesError(null);
      await refreshProfile();
    },
    onError: (error: Error) => {
      setCoursesError(error.message);
    },
  });

  if (profileQuery.isLoading) {
    return <ProfilePageSkeleton />;
  }

  if (!profileQuery.data) {
    return (
      <ProfilePageError
        message={
          profileQuery.error instanceof Error
            ? profileQuery.error.message
            : "We could not load the current profile."
        }
      />
    );
  }

  const profile = profileQuery.data;
  const institutions = institutionsQuery.data ?? [];
  const fields = fieldsQuery.data ?? [];
  const courseCatalog = courseCatalogQuery.data ?? [];
  const followersCount = followersQuery.data?.data.length ?? 0;
  const followingCount = followingQuery.data?.data.length ?? 0;

  const rightRail = (
    <div className="space-y-5">
      <ProfileStatsCard
        followers={followersCount}
        following={followingCount}
      />
      <ProfileSkillsCard
        skills={profile.skills}
        isSaving={addSkillMutation.isPending || removeSkillMutation.isPending}
        error={skillsError}
        onAdd={(name) => addSkillMutation.mutate(name)}
        onRemove={(skillId) => removeSkillMutation.mutate(skillId)}
      />
      <ProfileLinksCard profile={profile} />
      <ProfileCollaborativeCard />
    </div>
  );

  return (
    <AppShell activeItem="Profile" rightRail={rightRail}>
      <div className="mx-auto max-w-[56rem] space-y-5">
        <ProfileHero
          profile={profile}
          onEdit={() => {
            setProfileError(null);
            setIsEditingProfile(true);
          }}
        />

        <div className="grid gap-5 xl:hidden">{rightRail}</div>

        {isEditingProfile ? (
          <ProfileEditPanel
            profile={profile}
            isSaving={updateProfileMutation.isPending}
            error={profileError}
            onCancel={() => setIsEditingProfile(false)}
            onSave={(payload) => updateProfileMutation.mutate(payload)}
          />
        ) : null}

        <ProfileAboutCard profile={profile} />

        <ProfileEducationCard
          education={profile.education}
          institutions={institutions}
          fields={fields}
          isSaving={
            addEducationMutation.isPending ||
            updateEducationMutation.isPending ||
            deleteEducationMutation.isPending
          }
          error={educationError}
          onAdd={(payload) => addEducationMutation.mutate(payload)}
          onUpdate={(educationId, payload) =>
            updateEducationMutation.mutate({ educationId, payload })
          }
          onDelete={(educationId) => deleteEducationMutation.mutate(educationId)}
        />

        <ProfileCoursesCard
          courses={profile.courses}
          availableCourses={courseCatalog}
          isSaving={addCourseMutation.isPending || removeCourseMutation.isPending}
          error={coursesError}
          onAdd={(payload) => addCourseMutation.mutate(payload)}
          onRemove={(courseId) => removeCourseMutation.mutate(courseId)}
        />
      </div>
    </AppShell>
  );
}
