import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  StudentProfile,
  UpdateProfileRequest,
} from "../types/profile.types";

type ProfileEditPanelProps = {
  profile: StudentProfile;
  isSaving: boolean;
  error?: string | null;
  onCancel: () => void;
  onSave: (payload: UpdateProfileRequest) => void;
};

export function ProfileEditPanel({
  profile,
  isSaving,
  error,
  onCancel,
  onSave,
}: ProfileEditPanelProps) {
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(profile.website_url ?? "");
  const [visibility, setVisibility] = useState<"public" | "private">(
    profile.visibility === "private" ? "private" : "public"
  );

  useEffect(() => {
    setHeadline(profile.headline ?? "");
    setBio(profile.bio ?? "");
    setLocation(profile.location ?? "");
    setWebsiteUrl(profile.website_url ?? "");
    setVisibility(profile.visibility === "private" ? "private" : "public");
  }, [profile]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({
      headline: headline.trim(),
      bio: bio.trim(),
      location: location.trim(),
      website_url: websiteUrl.trim(),
      visibility,
    });
  }

  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardHeader className="p-5">
        <h2 className="text-lg font-semibold">Edit Profile</h2>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close profile editor"
          onClick={onCancel}
        >
          <X className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium">
            Headline
            <Input
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
              maxLength={150}
              placeholder="Computer Science student"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Location
            <Input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              maxLength={100}
              placeholder="Prishtina, Kosovo"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Website
            <Input
              value={websiteUrl}
              onChange={(event) => setWebsiteUrl(event.target.value)}
              placeholder="https://example.com"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Bio
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              maxLength={500}
              className="min-h-28 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow,border-color] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              placeholder="Tell other students what you are working on..."
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Visibility
            <select
              value={visibility}
              onChange={(event) =>
                setVisibility(event.target.value === "private" ? "private" : "public")
              }
              className="h-11 rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </label>

          {error ? (
            <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              className="bg-[#073f43] text-white hover:bg-[#062f33]"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
