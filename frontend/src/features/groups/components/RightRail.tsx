import type { FormEvent } from "react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Globe, Lock, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { groupsApi } from "../api/groupsApi";
import type { Group } from "../types/groups.types";
import type { GroupMembership } from "../types/groups.types";
import { GroupList } from "./GroupList";

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return fallback;
}

function CreateGroupCompactCard({ onGroupCreated }: { onGroupCreated: (group: Group) => void }) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  const createGroupMutation = useMutation({
    mutationFn: groupsApi.createGroup,
    onSuccess: (group) => {
      setName("");
      setDescription("");
      setVisibility("public");
      setIsExpanded(false);
      onGroupCreated(group);
      void queryClient.invalidateQueries({ queryKey: ["groups", "my"] });
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;

    createGroupMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      visibility,
    });
  }

  if (isExpanded) {
    return (
      <form
        className="space-y-3 overflow-hidden rounded-2xl border border-[#d6dde3] bg-white p-4 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#101820]">Create a new group</h3>
            <p className="mt-1 text-xs leading-5 text-[#7a8e91]">Set up another community.</p>
          </div>
          <button
            type="button"
            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-[#7a8e91] transition hover:bg-[#f3f6fb] hover:text-[#073f43]"
            onClick={() => setIsExpanded(false)}
            aria-label="Close create group form"
          >
            <X className="size-3.5" />
          </button>
        </div>

        <Input
          placeholder="Group name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="h-9 border-[#c8d1d7] text-sm focus-visible:border-[#073f43]"
          required
        />

        <textarea
          className="min-h-20 w-full resize-none rounded-lg border border-[#c8d1d7] bg-white px-3 py-2 text-sm outline-none transition focus-visible:border-[#073f43] focus-visible:ring-2 focus-visible:ring-[#073f43]/20"
          placeholder="Description (optional)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <div className="grid grid-cols-2 gap-2">
          {(["public", "private"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setVisibility(option)}
              className={`flex h-9 items-center justify-center gap-2 rounded-lg border text-xs font-semibold transition ${
                visibility === option
                  ? "border-[#073f43] bg-[#073f43] text-white"
                  : "border-[#c8d1d7] bg-white text-[#3d5156] hover:border-[#073f43]/40"
              }`}
            >
              {option === "public" ? <Globe className="size-3.5" /> : <Lock className="size-3.5" />}
              {option === "public" ? "Public" : "Private"}
            </button>
          ))}
        </div>

        {createGroupMutation.error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {getErrorMessage(createGroupMutation.error, "Could not create group.")}
          </p>
        ) : null}

        <Button
          className="h-9 w-full rounded-xl bg-[#073f43] text-xs font-semibold text-white hover:bg-[#052c2f]"
          disabled={!name.trim() || createGroupMutation.isPending}
        >
          <Plus className="size-3.5" />
          {createGroupMutation.isPending ? "Creating..." : "Create group"}
        </Button>
      </form>
    );
  }

  return (
    <button
      type="button"
      className="w-full overflow-hidden rounded-2xl border border-dashed border-[#c8d1d7] bg-white p-4 text-left transition hover:border-[#073f43]/40 hover:shadow-sm"
      onClick={() => setIsExpanded(true)}
    >
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
    </button>
  );
}

type RightRailProps = {
  memberships: GroupMembership[];
  selectedGroupId?: number;
  onSelectGroup: (groupId: number) => void;
  onGroupCreated: (group: Group) => void;
};

export function RightRail({
  memberships,
  selectedGroupId,
  onSelectGroup,
  onGroupCreated,
}: RightRailProps) {
  return (
    <div className="space-y-4">
      <GroupList
        memberships={memberships}
        selectedGroupId={selectedGroupId}
        onSelectGroup={onSelectGroup}
      />
      <CreateGroupCompactCard onGroupCreated={onGroupCreated} />
    </div>
  );
}
