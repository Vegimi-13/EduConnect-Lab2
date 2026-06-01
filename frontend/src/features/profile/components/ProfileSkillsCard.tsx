import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Plus, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ProfileSkill } from "../types/profile.types";

type ProfileSkillsCardProps = {
  skills: ProfileSkill[];
  isSaving: boolean;
  error?: string | null;
  onAdd?: (name: string) => void;
  onRemove?: (skillId: number) => void;
};

export function ProfileSkillsCard({
  skills,
  isSaving,
  error,
  onAdd,
  onRemove,
}: ProfileSkillsCardProps) {
  const [skillName, setSkillName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const canEdit = Boolean(onAdd && onRemove);

  useEffect(() => {
    if (!isSaving) {
      setSkillName("");
    }
  }, [isSaving]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!onAdd) return;

    const name = skillName.trim();

    if (!name) {
      setLocalError("Enter a skill name first.");
      return;
    }

    const alreadyExists = skills.some(
      (skill) => skill.name.trim().toLowerCase() === name.toLowerCase()
    );

    if (alreadyExists) {
      setLocalError("Skill already added.");
      return;
    }

    setLocalError(null);
    onAdd(name);
  }

  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardHeader className="p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="size-5" />
          Skills
        </h2>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-6">
        {canEdit ? (
          <form className="flex gap-2" onSubmit={handleSubmit}>
            <Input
              value={skillName}
              onChange={(event) => {
                setSkillName(event.target.value);
                if (localError) {
                  setLocalError(null);
                }
              }}
              placeholder="Add a skill"
              maxLength={60}
            />
            <Button
              size="icon-sm"
              className="bg-[#8a5a00] text-white hover:bg-[#714900]"
              aria-label="Add skill"
              disabled={isSaving}
            >
              <Plus className="size-4" />
            </Button>
          </form>
        ) : null}

        {localError || error ? (
          <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {localError || error}
          </p>
        ) : null}

        {skills.length ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <button
                key={skill.id}
                type="button"
                className={`inline-flex items-center gap-2 rounded-md border border-[#b8c4c7] bg-[#dceaff] px-3 py-2 text-sm text-[#1f2937] ${
                  !canEdit ? "cursor-default" : ""
                }`}
                onClick={canEdit ? () => onRemove?.(skill.id) : undefined}
              >
                {skill.name}
                {canEdit ? <Trash2 className="size-3.5 text-[#6b7280]" /> : null}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#4b5563]">
            {canEdit
              ? "Add a few skills so other students can quickly understand your strengths."
              : "This student hasn't added any skills yet."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
