import type { Group } from "../types/groups.types";

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function getGroupDescription(group: Group) {
  return (
    group.description ??
    "A focused academic space for sharing resources, discussing projects, and coordinating study sessions."
  );
}
