import { useState } from "react";

import type { Group } from "../types/groups.types";
import { AboutTab } from "./AboutTab";
import { ChannelsTab } from "./ChannelsTab";
import { FeedTab } from "./FeedTab";
import { GroupHero } from "./GroupHero";
import { GroupSettingsModal } from "./GroupSettingsModal";
import { MembersTab } from "./MembersTab";

type GroupTab = "feed" | "channels" | "members" | "about";

type SelectedGroupViewProps = {
  group: Group;
  activeTab: GroupTab;
  onTabChange: (tab: GroupTab) => void;
};

export function SelectedGroupView({
  group,
  activeTab,
  onTabChange,
}: SelectedGroupViewProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <GroupHero
        group={group}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {activeTab === "feed" && <FeedTab groupId={group.id} />}
      {activeTab === "channels" && <ChannelsTab group={group} />}
      {activeTab === "members" && <MembersTab groupId={group.id} />}
      {activeTab === "about" && <AboutTab group={group} />}

      {isSettingsOpen && (
        <GroupSettingsModal group={group} onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
}
