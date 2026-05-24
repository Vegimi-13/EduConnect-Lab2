import { isAxiosError } from "axios";

import { api } from "@/lib/axios";
import type {
  AddCourseRequest,
  AddSkillRequest,
  ApiMessageResponse,
  CourseReference,
  CreateEducationRequest,
  FieldOfStudy,
  FollowListResponse,
  Institution,
  ProfileApiErrorResponse,
  ProfileCourse,
  ProfileEducation,
  ProfileSkill,
  StudentProfile,
  UpdateEducationRequest,
  UpdateProfileRequest,
} from "../types/profile.types";

function createProfileApiError(message: string, status?: number) {
  return {
    name: "ProfileApiError",
    message,
    status,
  };
}

function toProfileApiError(error: unknown) {
  if (isAxiosError<ProfileApiErrorResponse>(error)) {
    return createProfileApiError(
      error.response?.data?.message ?? error.message ?? "Profile request failed",
      error.response?.status
    );
  }

  if (error instanceof Error) {
    return createProfileApiError(error.message);
  }

  return createProfileApiError("Profile request failed");
}

async function requestProfile<T>(request: Promise<{ data: T }>) {
  try {
    const { data } = await request;
    return data;
  } catch (error) {
    throw toProfileApiError(error);
  }
}

function getMyProfile() {
  return requestProfile(api.get<StudentProfile>("/profile/me"));
}

function updateMyProfile(payload: UpdateProfileRequest) {
  return requestProfile(api.put<StudentProfile>("/profile/me", payload));
}

function getInstitutions() {
  return requestProfile(api.get<Institution[]>("/profile/institutions"));
}

function getFields() {
  return requestProfile(api.get<FieldOfStudy[]>("/profile/fields"));
}

function getCourses() {
  return requestProfile(api.get<CourseReference[]>("/profile/courses"));
}

function addSkill(payload: AddSkillRequest) {
  return requestProfile(api.post<ProfileSkill>("/profile/skills", payload));
}

function removeSkill(skillId: number) {
  return requestProfile(
    api.delete<ApiMessageResponse>(`/profile/skills/${skillId}`)
  );
}

function addEducation(payload: CreateEducationRequest) {
  return requestProfile(
    api.post<ProfileEducation>("/profile/education", payload)
  );
}

function updateEducation(educationId: number, payload: UpdateEducationRequest) {
  return requestProfile(
    api.put<ProfileEducation>(`/profile/education/${educationId}`, payload)
  );
}

function deleteEducation(educationId: number) {
  return requestProfile(
    api.delete<ApiMessageResponse>(`/profile/education/${educationId}`)
  );
}

function addCourse(payload: AddCourseRequest) {
  return requestProfile(api.post<ProfileCourse>("/profile/courses", payload));
}

function removeCourse(courseId: number) {
  return requestProfile(
    api.delete<ApiMessageResponse>(`/profile/courses/${courseId}`)
  );
}

function getFollowers(userId: number) {
  return requestProfile(api.get<FollowListResponse>(`/follow/followers/${userId}`));
}

function getFollowing(userId: number) {
  return requestProfile(api.get<FollowListResponse>(`/follow/following/${userId}`));
}

export const profileApi = {
  getMyProfile,
  updateMyProfile,
  getInstitutions,
  getFields,
  getCourses,
  addSkill,
  removeSkill,
  addEducation,
  updateEducation,
  deleteEducation,
  addCourse,
  removeCourse,
  getFollowers,
  getFollowing,
};
