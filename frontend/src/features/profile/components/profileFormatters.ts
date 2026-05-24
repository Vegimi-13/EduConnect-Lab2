import type { StudentProfile } from "../types/profile.types";

export function getProfileName(profile: StudentProfile) {
  return `${profile.first_name} ${profile.last_name}`.trim();
}

export function getProfileInitials(profile: StudentProfile) {
  const first = profile.first_name?.[0] ?? "";
  const last = profile.last_name?.[0] ?? "";

  return `${first}${last}`.toUpperCase() || "EC";
}

export function getProfileHeadline(profile: StudentProfile) {
  return profile.headline || "Student at EduConnect";
}

export function formatYearRange(start?: number | null, end?: number | null) {
  if (!start && !end) {
    return "Dates not set";
  }

  if (start && !end) {
    return `${start} - Present`;
  }

  if (!start && end) {
    return String(end);
  }

  return `${start} - ${end}`;
}
