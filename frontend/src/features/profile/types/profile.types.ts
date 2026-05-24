export type ProfileVisibility = "public" | "private";

export type StudentProfile = {
  user_id: number;
  first_name: string;
  last_name: string;
  email?: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  website_url: string | null;
  visibility?: ProfileVisibility | string | null;
  skills: ProfileSkill[];
  education: ProfileEducation[];
  courses: ProfileCourse[];
};

export type ProfileSkill = {
  id: number;
  name: string;
};

export type ProfileEducation = {
  id: number;
  institution_id: number;
  field_id: number | null;
  degree: string | null;
  start_year: number | null;
  end_year: number | null;
  description: string | null;
};

export type ProfileCourse = {
  user_id?: number;
  course_id: number;
  semester: string | null;
  year: number | null;
  course?: {
    id: number;
    code: string | null;
    name: string;
    institution?: {
      id: number;
      name: string;
    } | null;
    field?: {
      id: number;
      name: string;
    } | null;
  };
};

export type Institution = {
  id: number;
  name: string;
  country?: string | null;
  city?: string | null;
  website?: string | null;
};

export type FieldOfStudy = {
  id: number;
  name: string;
};

export type CourseReference = {
  id: number;
  institution_id: number;
  field_id: number | null;
  code: string | null;
  name: string;
  description: string | null;
  institution?: {
    id: number;
    name: string;
  } | null;
  field?: {
    id: number;
    name: string;
  } | null;
};

export type UpdateProfileRequest = {
  headline?: string;
  bio?: string;
  location?: string;
  website_url?: string;
  visibility?: ProfileVisibility;
};

export type AddSkillRequest = {
  skill_id?: number;
  name?: string;
};

export type CreateEducationRequest = {
  institution_id: number;
  field_id: number;
  degree: string;
  start_year: number;
  end_year?: number | null;
  description?: string | null;
};

export type UpdateEducationRequest = Partial<CreateEducationRequest>;

export type AddCourseRequest = {
  course_id: number;
  semester: string | null;
  year: number | null;
};

export type FollowRecord = {
  follower_id?: number;
  following_id?: number;
  status?: string;
};

export type FollowListResponse = {
  message: string;
  data: FollowRecord[];
};

export type ApiMessageResponse = {
  message: string;
};

export type ProfileApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};
