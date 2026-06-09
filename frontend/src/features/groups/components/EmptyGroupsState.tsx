import type { FormEvent } from "react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Globe, Hash, Lock, Plus, Users, UsersRound, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { groupsApi } from "../api/groupsApi";

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return fallback;
}

export function EmptyGroupsState() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  const createGroupMutation = useMutation({
    mutationFn: groupsApi.createGroup,
    onSuccess: () => {
      setName("");
      setDescription("");
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

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-3xl items-center py-8">
      <div className="w-full overflow-hidden rounded-2xl border border-[#d6dde3] bg-white shadow-lg">
        <div className="relative overflow-hidden bg-[#073f43] px-8 py-10 text-white">
          <div className="absolute -right-12 -top-12 size-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 right-16 size-32 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
              <UsersRound className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Your Groups</h1>
              <p className="mt-1 text-sm text-white/70">
                You haven't joined or created any groups yet.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-2">
          <div className="border-r border-[#edf3fb] p-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#073f43]">
              Why create a group?
            </p>
            <ul className="mt-5 space-y-4">
              {[
                { icon: Users, text: "Collaborate with classmates and lab partners" },
                { icon: Hash, text: "Focused channels for each topic or project" },
                { icon: Zap, text: "Real-time chat and group-level post feed" },
                { icon: Globe, text: "Public or private — you control access" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#edf3fb]">
                    <Icon className="size-3.5 text-[#073f43]" />
                  </div>
                  <span className="text-sm leading-6 text-[#3d5156]">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <form className="space-y-4 p-8" onSubmit={handleSubmit}>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-[#073f43]">
                Create your first group
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#101820]" htmlFor="group-name">
                Group name
              </label>
              <Input
                id="group-name"
                placeholder="Computer Science Students"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-[#c8d1d7] focus-visible:border-[#073f43]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#101820]" htmlFor="group-description">
                Description <span className="font-normal text-[#8a9a9c]">(optional)</span>
              </label>
              <textarea
                id="group-description"
                className="min-h-24 w-full resize-none rounded-lg border border-[#c8d1d7] bg-white px-3 py-2 text-sm outline-none transition focus-visible:border-[#073f43] focus-visible:ring-2 focus-visible:ring-[#073f43]/20"
                placeholder="What is this group about?"
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
                  className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition ${
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
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {getErrorMessage(createGroupMutation.error, "Could not create group.")}
              </p>
            ) : null}

            <Button
              className="h-11 w-full rounded-xl bg-[#073f43] text-sm font-semibold text-white hover:bg-[#052c2f]"
              disabled={!name.trim() || createGroupMutation.isPending}
            >
              <Plus className="size-4" />
              {createGroupMutation.isPending ? "Creating..." : "Create group"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

