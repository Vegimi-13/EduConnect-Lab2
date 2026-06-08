import { Check, Hash, Info, Settings, Users, Zap } from "lucide-react";
import type { Group } from "../types/groups.types";

type GroupTab = "feed" | "channels" | "members" | "about";

const tabs: Array<{ label: string; value: GroupTab; icon: React.ElementType }> = [
  { label: "Feed", value: "feed", icon: Zap },
  { label: "Channels", value: "channels", icon: Hash },
  { label: "Members", value: "members", icon: Users },
  { label: "About", value: "about", icon: Info },
];

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getGroupDescription(group: Group) {
  return (
    group.description ??
    "A focused academic space for sharing resources, discussing projects, and coordinating study sessions."
  );
}

type GroupHeroProps = {
  group: Group;
  activeTab: GroupTab;
  onTabChange: (tab: GroupTab) => void;
  onOpenSettings: () => void;
};

export function GroupHero({
  group,
  activeTab,
  onTabChange,
  onOpenSettings,
}: GroupHeroProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#d6dde3] bg-white shadow-sm">
      <div className="relative overflow-hidden bg-[#073f43] px-6 py-6 text-white">
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 right-32 size-24 rounded-full bg-white/5" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-lg font-bold">
              {getInitials(group.name)}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight">{group.name}</h1>
              <p className="mt-1 line-clamp-1 text-sm text-white/65">
                {getGroupDescription(group)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
              <Check className="size-3.5" />
              Joined
            </div>
            <button
              type="button"
              aria-label="Group settings"
              onClick={onOpenSettings}
              className="flex size-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 transition hover:bg-white/20"
            >
              <Settings className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTabChange(tab.value)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "border-[#073f43] text-[#073f43]"
                  : "border-transparent text-[#7a8e91] hover:text-[#3d5156]"
              }`}
            >
              <Icon className="size-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}