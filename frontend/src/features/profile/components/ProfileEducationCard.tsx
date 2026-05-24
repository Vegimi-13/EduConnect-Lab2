import { useMemo, useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { GraduationCap, Pencil, Plus, Save, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  CreateEducationRequest,
  FieldOfStudy,
  Institution,
  ProfileEducation,
  UpdateEducationRequest,
} from "../types/profile.types";
import { formatYearRange } from "./profileFormatters";

type EducationDraft = {
  institution_id: string;
  field_id: string;
  degree: string;
  start_year: string;
  end_year: string;
  description: string;
};

type ProfileEducationCardProps = {
  education: ProfileEducation[];
  institutions: Institution[];
  fields: FieldOfStudy[];
  isSaving: boolean;
  error?: string | null;
  onAdd: (payload: CreateEducationRequest) => void;
  onUpdate: (educationId: number, payload: UpdateEducationRequest) => void;
  onDelete: (educationId: number) => void;
};

function emptyDraft(): EducationDraft {
  return {
    institution_id: "",
    field_id: "",
    degree: "",
    start_year: "",
    end_year: "",
    description: "",
  };
}

function draftFromEducation(item: ProfileEducation): EducationDraft {
  return {
    institution_id: String(item.institution_id),
    field_id: item.field_id ? String(item.field_id) : "",
    degree: item.degree ?? "",
    start_year: item.start_year ? String(item.start_year) : "",
    end_year: item.end_year ? String(item.end_year) : "",
    description: item.description ?? "",
  };
}

function getInstitutionName(institutions: Institution[], institutionId: number) {
  return (
    institutions.find((institution) => institution.id === institutionId)?.name ??
    "Institution"
  );
}

function getFieldName(fields: FieldOfStudy[], fieldId: number | null) {
  if (!fieldId) {
    return "Field not specified";
  }

  return fields.find((field) => field.id === fieldId)?.name ?? "Field";
}

function toEducationPayload(draft: EducationDraft) {
  const institutionId = Number(draft.institution_id);
  const fieldId = Number(draft.field_id);
  const startYear = Number(draft.start_year);
  const endYear = draft.end_year ? Number(draft.end_year) : null;

  if (!institutionId || !fieldId || !startYear || !draft.degree.trim()) {
    return null;
  }

  return {
    institution_id: institutionId,
    field_id: fieldId,
    degree: draft.degree.trim(),
    start_year: startYear,
    end_year: endYear,
    description: draft.description.trim() || null,
  };
}

export function ProfileEducationCard({
  education,
  institutions,
  fields,
  isSaving,
  error,
  onAdd,
  onUpdate,
  onDelete,
}: ProfileEducationCardProps) {
  const [createDraft, setCreateDraft] = useState<EducationDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState<EducationDraft>(emptyDraft);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const sortedEducation = useMemo(
    () =>
      [...education].sort(
        (a, b) => (b.start_year ?? 0) - (a.start_year ?? 0)
      ),
    [education]
  );

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = toEducationPayload(createDraft);

    if (!payload) {
      setLocalError("Institution, field, degree, and start year are required.");
      return;
    }

    setLocalError(null);
    onAdd(payload);
    setCreateDraft(emptyDraft());
    setIsCreateOpen(false);
  }

  function handleEditStart(item: ProfileEducation) {
    setEditingId(item.id);
    setEditingDraft(draftFromEducation(item));
    setLocalError(null);
  }

  function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingId === null) {
      return;
    }

    const payload = toEducationPayload(editingDraft);

    if (!payload) {
      setLocalError("Institution, field, degree, and start year are required.");
      return;
    }

    setLocalError(null);
    onUpdate(editingId, payload);
    setEditingId(null);
    setEditingDraft(emptyDraft());
  }

  function updateDraft(
    setter: Dispatch<SetStateAction<EducationDraft>>,
    key: keyof EducationDraft,
    value: string
  ) {
    setter((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardHeader className="p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <GraduationCap className="size-5" />
          Education
        </h2>
        <Button
          type="button"
          className="bg-[#073f43] text-white hover:bg-[#062f33]"
          onClick={() => {
            setLocalError(null);
            setIsCreateOpen((current) => !current);
          }}
        >
          <Plus className="size-4" />
          {isCreateOpen ? "Close" : "Add Education"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-5 px-5 pb-5">
        {isCreateOpen ? (
          <form
            className="grid gap-4 rounded-md border border-[#d6dde3] bg-[#f7fafc] p-4"
            onSubmit={handleCreate}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Institution
                <select
                  value={createDraft.institution_id}
                  onChange={(event) =>
                    updateDraft(
                      setCreateDraft,
                      "institution_id",
                      event.target.value
                    )
                  }
                  className="h-11 rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                >
                  <option value="">Select institution</option>
                  {institutions.map((institution) => (
                    <option key={institution.id} value={institution.id}>
                      {institution.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Field
                <select
                  value={createDraft.field_id}
                  onChange={(event) =>
                    updateDraft(setCreateDraft, "field_id", event.target.value)
                  }
                  className="h-11 rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                >
                  <option value="">Select field</option>
                  {fields.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium">
              Degree
              <Input
                value={createDraft.degree}
                onChange={(event) =>
                  updateDraft(setCreateDraft, "degree", event.target.value)
                }
                placeholder="Bachelor of Computer Science"
              />
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Start year
                <Input
                  type="number"
                  value={createDraft.start_year}
                  onChange={(event) =>
                    updateDraft(setCreateDraft, "start_year", event.target.value)
                  }
                  placeholder="2022"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                End year
                <Input
                  type="number"
                  value={createDraft.end_year}
                  onChange={(event) =>
                    updateDraft(setCreateDraft, "end_year", event.target.value)
                  }
                  placeholder="2026"
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium">
              Description
              <Input
                value={createDraft.description}
                onChange={(event) =>
                  updateDraft(setCreateDraft, "description", event.target.value)
                }
                placeholder="Faculty, honors, or specialization"
              />
            </label>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {localError || error ? (
                <p className="text-sm text-destructive">{localError || error}</p>
              ) : (
                <span className="text-sm text-[#4b5563]">
                  Add each academic step separately so the timeline stays clean.
                </span>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[#073f43] text-white hover:bg-[#062f33]"
                  disabled={isSaving}
                >
                  <Plus className="size-4" />
                  Save Education
                </Button>
              </div>
            </div>
          </form>
        ) : null}

        <div className="divide-y divide-[#d6dde3]">
          {sortedEducation.length ? (
            sortedEducation.map((item) => {
              const isEditing = editingId === item.id;

              return (
                <div key={item.id} className="py-5 first:pt-0">
                  {isEditing ? (
                    <form className="grid gap-3" onSubmit={handleEditSubmit}>
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="grid gap-2 text-sm font-medium">
                          Institution
                          <select
                            value={editingDraft.institution_id}
                            onChange={(event) =>
                              updateDraft(
                                setEditingDraft,
                                "institution_id",
                                event.target.value
                              )
                            }
                            className="h-11 rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                          >
                            <option value="">Select institution</option>
                            {institutions.map((institution) => (
                              <option key={institution.id} value={institution.id}>
                                {institution.name}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="grid gap-2 text-sm font-medium">
                          Field
                          <select
                            value={editingDraft.field_id}
                            onChange={(event) =>
                              updateDraft(
                                setEditingDraft,
                                "field_id",
                                event.target.value
                              )
                            }
                            className="h-11 rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                          >
                            <option value="">Select field</option>
                            {fields.map((field) => (
                              <option key={field.id} value={field.id}>
                                {field.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div className="grid gap-3 md:grid-cols-3">
                        <label className="grid gap-2 text-sm font-medium md:col-span-2">
                          Degree
                          <Input
                            value={editingDraft.degree}
                            onChange={(event) =>
                              updateDraft(
                                setEditingDraft,
                                "degree",
                                event.target.value
                              )
                            }
                          />
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                          Start year
                          <Input
                            type="number"
                            value={editingDraft.start_year}
                            onChange={(event) =>
                              updateDraft(
                                setEditingDraft,
                                "start_year",
                                event.target.value
                              )
                            }
                          />
                        </label>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="grid gap-2 text-sm font-medium">
                          End year
                          <Input
                            type="number"
                            value={editingDraft.end_year}
                            onChange={(event) =>
                              updateDraft(
                                setEditingDraft,
                                "end_year",
                                event.target.value
                              )
                            }
                          />
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                          Description
                          <Input
                            value={editingDraft.description}
                            onChange={(event) =>
                              updateDraft(
                                setEditingDraft,
                                "description",
                                event.target.value
                              )
                            }
                          />
                        </label>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="size-4" />
                          Cancel
                        </Button>
                        <Button
                          className="bg-[#073f43] text-white hover:bg-[#062f33]"
                          disabled={isSaving}
                        >
                          <Save className="size-4" />
                          Save
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded bg-[#dbe8fb]">
                        <GraduationCap className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-sm font-bold">
                              {getInstitutionName(
                                institutions,
                                item.institution_id
                              )}
                            </h3>
                            <p className="mt-1 text-sm font-medium">
                              {item.degree || "Degree not specified"}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs font-medium">
                            {formatYearRange(item.start_year, item.end_year)}
                          </span>
                        </div>
                        <p className="mt-2 text-xs font-medium tracking-[0.04em] text-[#4b5563]">
                          {getFieldName(fields, item.field_id)}
                        </p>
                        {item.description ? (
                          <p className="mt-2 text-sm text-[#1f2937]">
                            {item.description}
                          </p>
                        ) : null}
                        <div className="mt-4 flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditStart(item)}
                          >
                            <Pencil className="size-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(item.id)}
                          >
                            <Trash2 className="size-3.5" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-[#4b5563]">
              Add your institutions, degree path, and specialization here.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
