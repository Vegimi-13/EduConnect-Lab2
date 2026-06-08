import { Plus } from "lucide-react";

import type { GroupMembership } from "../types/groups.types";
import { GroupList } from "./GroupList";

function CreateGroupCompactCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-dashed border-[#c8d1d7] bg-white p-4 transition hover:border-[#073f43]/40 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#ffc85c]">
          <Plus className="size-4 text-[#6b4a05]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#101820]">Create a new group</h3>
          <p className="mt-1 text-xs leading-5 text-[#7a8e91]">
            Start a class, research team, or project community.
          </p>
        </div>
      </div>
    </div>
  );
}

type RightRailProps = {
  memberships: GroupMembership[];
  selectedGroupId?: number;
  onSelectGroup: (groupId: number) => void;
};

export function RightRail({
  memberships,
  selectedGroupId,
  onSelectGroup,
}: RightRailProps) {
  return (
    <div className="space-y-4">
      <GroupList
        memberships={memberships}
        selectedGroupId={selectedGroupId}
        onSelectGroup={onSelectGroup}
      />
      <CreateGroupCompactCard />
    </div>
  );
}
