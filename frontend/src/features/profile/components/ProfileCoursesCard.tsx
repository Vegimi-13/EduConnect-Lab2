import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { BookOpen, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  AddCourseRequest,
  CourseReference,
  ProfileCourse,
} from "../types/profile.types";

type CourseDraft = {
  course_id: string;
  semester: string;
  year: string;
};

type ProfileCoursesCardProps = {
  courses: ProfileCourse[];
  availableCourses: CourseReference[];
  isSaving: boolean;
  error?: string | null;
  onAdd?: (payload: AddCourseRequest) => void;
  onRemove?: (courseId: number) => void;
};

const emptyDraft: CourseDraft = {
  course_id: "",
  semester: "",
  year: "",
};

function getCourseLabel(course: ProfileCourse) {
  if (course.course?.name) {
    return course.course.name;
  }

  return `Course #${course.course_id}`;
}

function getCourseCode(course: ProfileCourse) {
  return course.course?.code || `COURSE-${course.course_id}`;
}

function getCourseMeta(course: ProfileCourse) {
  const semester = course.semester || "Semester not set";
  const year = course.year ? String(course.year) : "Year not set";

  return `${semester} • ${year}`;
}

export function ProfileCoursesCard({
  courses,
  availableCourses,
  isSaving,
  error,
  onAdd,
  onRemove,
}: ProfileCoursesCardProps) {
  const [draft, setDraft] = useState<CourseDraft>(emptyDraft);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const canEdit = Boolean(onAdd && onRemove);

  const assignedCourseIds = useMemo(
    () => new Set(courses.map((course) => course.course_id)),
    [courses]
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!onAdd) return;

    const courseId = Number(draft.course_id);

    if (!courseId) {
      setLocalError("Choose a course first.");
      return;
    }

    setLocalError(null);
    onAdd({
      course_id: courseId,
      semester: draft.semester.trim() || null,
      year: draft.year ? Number(draft.year) : null,
    });
    setDraft({ ...emptyDraft });
    setIsCreateOpen(false);
  }

  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardHeader className="p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <BookOpen className="size-5" />
          Courses
        </h2>
        {canEdit ? (
          <Button
            type="button"
            className="bg-[#073f43] text-white hover:bg-[#062f33]"
            onClick={() => {
              setLocalError(null);
              setIsCreateOpen((current) => !current);
            }}
          >
            <Plus className="size-4" />
            {isCreateOpen ? "Close" : "Add Course"}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-5 px-5 pb-5">
        {isCreateOpen && canEdit ? (
          <form
            className="grid gap-4 rounded-md border border-[#d6dde3] bg-[#f7fafc] p-4"
            onSubmit={handleSubmit}
          >
            <label className="grid gap-2 text-sm font-medium">
              Course
              <select
                value={draft.course_id}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    course_id: event.target.value,
                  }))
                }
                className="h-11 rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                <option value="">Select course</option>
                {availableCourses
                  .filter((course) => !assignedCourseIds.has(course.id))
                  .map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code ? `${course.code} - ` : ""}
                      {course.name}
                    </option>
                  ))}
              </select>
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Semester
                <Input
                  value={draft.semester}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      semester: event.target.value,
                    }))
                  }
                  placeholder="Fall"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Year
                <Input
                  type="number"
                  value={draft.year}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      year: event.target.value,
                    }))
                  }
                  placeholder="2026"
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {localError || error ? (
                <p className="text-sm text-destructive">{localError || error}</p>
              ) : (
                <span className="text-sm text-[#4b5563]">
                  Pull from the course catalog so your profile stays consistent
                  with the backend records.
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
                  Save Course
                </Button>
              </div>
            </div>
          </form>
        ) : null}

        {courses.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {courses.map((course) => (
              <div
                key={course.course_id}
                className="rounded-md border-l-4 border-[#0b5557] bg-[#edf3fb] p-4"
              >
                <p className="text-xs font-medium tracking-[0.06em]">
                  {getCourseCode(course)}
                </p>
                <h3 className="mt-2 text-sm font-bold">
                  {getCourseLabel(course)}
                </h3>
                <p className="mt-3 text-xs font-semibold text-[#6b4a05]">
                  {getCourseMeta(course)}
                </p>
                {canEdit ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-3 px-0 text-[#7a1d1d] hover:bg-transparent hover:text-[#5f1515]"
                    onClick={() => onRemove?.(course.course_id)}
                  >
                    <Trash2 className="size-3.5" />
                    Remove
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#4b5563]">
            {canEdit
              ? "Add current or completed courses to make your academic path visible."
              : "This student hasn't added any courses yet."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
