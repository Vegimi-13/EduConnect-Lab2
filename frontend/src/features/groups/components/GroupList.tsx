import type { GroupMembership } from "../types/groups.types";
import { Avatar } from "./Avatar";

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

type GroupListProps = {
  memberships: GroupMembership[];
  selectedGroupId?: number;
  onSelectGroup: (groupId: number) => void;
};

export function GroupList({
  memberships,
  selectedGroupId,
  onSelectGroup,
}: GroupListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#d6dde3] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#edf3fb] px-4 py-3">
        <h2 className="text-sm font-bold text-[#101820]">My Groups</h2>
        <span className="rounded-full bg-[#073f43] px-2.5 py-0.5 text-xs font-bold text-white">
          {memberships.length}
        </span>
      </div>
      <div className="divide-y divide-[#f3f6fb]">
        {memberships.map((membership) => {
          const group = membership.group;
          const isSelected = group.id === selectedGroupId;

          return (
            <button
              key={group.id}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                isSelected ? "bg-[#edf8f4]" : "hover:bg-[#f8fafc]"
              }`}
              type="button"
              onClick={() => onSelectGroup(group.id)}
            >
              <Avatar initials={getInitials(group.name)} size="sm" />
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-semibold ${isSelected ? "text-[#073f43]" : "text-[#101820]"}`}>
                  {group.name}
                </p>
                <p className="text-xs text-[#7a8e91]">{membership.role ?? "member"}</p>
              </div>
              {isSelected && (
                <div className="size-1.5 shrink-0 rounded-full bg-[#073f43]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
