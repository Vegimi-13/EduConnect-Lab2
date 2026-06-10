import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/AppShell";
import { groupsApi } from "../../groups/api/groupsApi";
import type { GroupMembership } from "../../groups/types/groups.types";

import { EmptyGroupsState } from "../components/EmptyGroupsState";
import { RightRail } from "../components/RightRail";
import { SelectedGroupView } from "../components/SelectedGroupView";

type GroupTab = "feed" | "channels" | "members" | "about";

const EMPTY_MEMBERSHIPS: GroupMembership[] = [];
export function MyGroupsPage() {
  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>();
  const [activeTab, setActiveTab] = useState<GroupTab>("channels");

  const myGroupsQuery = useQuery({
    queryKey: ["groups", "my"],
    queryFn: groupsApi.getMyGroups,
    retry: false,
  });

  const memberships = myGroupsQuery.data ?? EMPTY_MEMBERSHIPS;

  const selectedMembership = useMemo(
    () => memberships.find((m) => m.group.id === selectedGroupId) ?? memberships[0],
    [memberships, selectedGroupId]
  );

  if (myGroupsQuery.isLoading) {
    return (
      <AppShell activeItem="My Groups">
        <div className="overflow-hidden rounded-2xl border border-[#d6dde3] bg-white p-5 shadow-sm">
          <p className="text-sm text-[#7a8e91]">Loading your groups...</p>
        </div>
      </AppShell>
    );
  }

  if (!memberships.length) {
    return (
      <AppShell activeItem="My Groups">
        <EmptyGroupsState />
      </AppShell>
    );
  }

  return (
    <AppShell
      activeItem="My Groups"
      rightRail={
        <RightRail
          memberships={memberships}
          selectedGroupId={selectedMembership?.group.id}
          onSelectGroup={(groupId) => {
            setSelectedGroupId(groupId);
            setActiveTab("channels");
          }}
          onGroupCreated={(group) => {
            setSelectedGroupId(group.id);
            setActiveTab("channels");
          }}
        />
      }
    >
      <div className="mx-auto w-full max-w-[58rem] py-4">
        {selectedMembership ? (
          <SelectedGroupView
            group={selectedMembership.group}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        ) : null}
      </div>
    </AppShell>
  );
}

