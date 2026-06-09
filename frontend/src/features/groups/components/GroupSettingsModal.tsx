import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Globe, Hash, Lock, Plus, Settings, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { groupsApi } from "../api/groupsApi";
import type { Group } from "../types/groups.types";
function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message: unknown }).message);
  }

  return fallback;
}
// ─── Group Settings Modal ─────────────────────────────────────────────────────

export function GroupSettingsModal({
  group,
  onClose,
}: {
  group: Group;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description ?? "");
  const [visibility, setVisibility] = useState<"public" | "private">(
    group.visibility === "private" ? "private" : "public"
  );
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");

  const updateGroupMutation = useMutation({
    mutationFn: () =>
      groupsApi.updateGroup(group.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        visibility,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["groups", "my"] });
    },
  });

  const createChannelMutation = useMutation({
    mutationFn: () =>
      groupsApi.createGroupChannel(group.id, {
        name: channelName.trim(),
        type: "text",
        description: channelDescription.trim() || undefined,
      }),
    onSuccess: () => {
      setChannelName("");
      setChannelDescription("");
      void queryClient.invalidateQueries({ queryKey: ["groups", group.id, "channels"] });
    },
  });

  function handleUpdateGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    updateGroupMutation.mutate();
  }

  function handleCreateChannel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!channelName.trim()) return;
    createChannelMutation.mutate();
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="max-h-[calc(100dvh-3rem)] w-full max-w-2xl overflow-hidden rounded-2xl border border-[#c8d1d7] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#edf3fb] bg-[#073f43] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl border border-white/20 bg-white/10">
              <Settings className="size-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Group settings</h2>
              <p className="text-xs text-white/60">{group.name}</p>
            </div>
          </div>
          {/* ✅ X is now correctly imported above */}
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 transition hover:bg-white/20"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="grid max-h-[calc(100dvh-9rem)] overflow-y-auto md:grid-cols-2">
          {/* Group info form */}
          <form
            className="space-y-4 border-b border-[#edf3fb] p-6 md:border-b-0 md:border-r"
            onSubmit={handleUpdateGroup}
          >
            <div>
              <h3 className="font-semibold text-[#101820]">Group info</h3>
              <p className="mt-1 text-xs leading-5 text-[#7a8e91]">
                Update the name, description, and visibility.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#101820]" htmlFor="settings-group-name">
                Name
              </label>
              <Input
                id="settings-group-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-[#c8d1d7] focus-visible:border-[#073f43]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#101820]" htmlFor="settings-group-description">
                Description
              </label>
              <textarea
                id="settings-group-description"
                className="min-h-24 w-full resize-none rounded-lg border border-[#c8d1d7] bg-white px-3 py-2 text-sm outline-none transition focus-visible:border-[#073f43] focus-visible:ring-2 focus-visible:ring-[#073f43]/20"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(["public", "private"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setVisibility(option)}
                  className={`flex items-center justify-center gap-2 rounded-lg border py-2 text-sm font-semibold transition ${
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

            {updateGroupMutation.error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {getErrorMessage(updateGroupMutation.error, "Could not update group.")}
              </p>
            ) : updateGroupMutation.isSuccess ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                Changes saved successfully.
              </p>
            ) : null}

            <Button
              className="w-full rounded-xl bg-[#073f43] font-semibold text-white hover:bg-[#052c2f]"
              disabled={!name.trim() || updateGroupMutation.isPending}
            >
              {updateGroupMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </form>

          {/* Create channel form */}
          <form className="space-y-4 p-6" onSubmit={handleCreateChannel}>
            <div>
              <h3 className="font-semibold text-[#101820]">Create channel</h3>
              <p className="mt-1 text-xs leading-5 text-[#7a8e91]">
                Add a focused space for announcements, labs, or project work.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#101820]" htmlFor="settings-channel-name">
                Channel name
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#7a8e91]" />
                <Input
                  id="settings-channel-name"
                  placeholder="announcements"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  className="border-[#c8d1d7] pl-8 focus-visible:border-[#073f43]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#101820]" htmlFor="settings-channel-description">
                Description <span className="font-normal text-[#8a9a9c]">(optional)</span>
              </label>
              <textarea
                id="settings-channel-description"
                className="min-h-24 w-full resize-none rounded-lg border border-[#c8d1d7] bg-white px-3 py-2 text-sm outline-none transition focus-visible:border-[#073f43] focus-visible:ring-2 focus-visible:ring-[#073f43]/20"
                placeholder="What should members discuss here?"
                value={channelDescription}
                onChange={(e) => setChannelDescription(e.target.value)}
              />
            </div>

            {createChannelMutation.error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {getErrorMessage(createChannelMutation.error, "Could not create channel.")}
              </p>
            ) : createChannelMutation.isSuccess ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                Channel created!
              </p>
            ) : null}

            <Button
              className="w-full rounded-xl bg-[#073f43] font-semibold text-white hover:bg-[#052c2f]"
              disabled={!channelName.trim() || createChannelMutation.isPending}
            >
              <Plus className="size-4" />
              {createChannelMutation.isPending ? "Creating..." : "Create channel"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
