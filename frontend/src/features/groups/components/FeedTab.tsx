import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image, MessageSquare, MoreVertical, Send, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { feedApi } from "@/features/feed/api/feedApi";
import type { FeedPost } from "@/features/feed/types/feed.types";
import { cloudinaryApi } from "@/lib/cloudinary";
import { Avatar } from "./Avatar";

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return fallback;
}
// ─── Feed Tab ─────────────────────────────────────────────────────────────────

export function FeedTab({ groupId }: { groupId: number }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const feedQuery = useQuery({
    queryKey: ["groups", groupId, "feed"],
    queryFn: () => feedApi.getFeed({ groupId, limit: 10 }),
    retry: false,
  });

  const createPostMutation = useMutation({
    mutationFn: async (postContent: string) => {
      const imageUrls = files.length ? await cloudinaryApi.uploadImages(files) : undefined;

      return feedApi.createPost({
        content: postContent,
        visibility: "GROUP",
        post_type: "TEXT",
        group_id: groupId,
        images: imageUrls,
      });
    },
    onSuccess: () => {
      setContent("");
      setFiles([]);
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ["groups", groupId, "feed"] });
    },
    onError: (caughtError) => {
      setError(getErrorMessage(caughtError, "Could not create group post."));
    },
  });

  function handleCreateGroupPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError("Write something before posting.");
      return;
    }

    createPostMutation.mutate(trimmedContent);
  }

  function handleFileChange(selectedFiles: FileList | null) {
    const imageFiles = Array.from(selectedFiles ?? [])
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 5);

    setFiles(imageFiles);
    setError(null);
  }

  const composer = (
    <form
      className="overflow-hidden rounded-2xl border border-[#d6dde3] bg-white p-4 shadow-sm"
      onSubmit={handleCreateGroupPost}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => handleFileChange(event.target.files)}
      />
      <div className="flex gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#073f43] text-white">
          <MessageSquare className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <textarea
            className="min-h-24 w-full resize-none rounded-xl border border-[#d6dde3] bg-[#f8fafc] px-3 py-2 text-sm leading-6 text-[#101820] outline-none transition focus:border-[#073f43] focus:bg-white"
            placeholder="Post an update to this group..."
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              setError(null);
            }}
            maxLength={1000}
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-destructive">{error ?? ""}</p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-[#c8d1d7]"
                onClick={() => fileInputRef.current?.click()}
                disabled={createPostMutation.isPending}
              >
                <Image className="size-4" />
                Images
              </Button>
              <Button
                className="bg-[#073f43] text-white hover:bg-[#062f33]"
                disabled={createPostMutation.isPending || !content.trim()}
              >
                <Send className="size-4" />
                {createPostMutation.isPending ? "Posting..." : "Post to group"}
              </Button>
            </div>
          </div>
          {files.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {files.map((file) => (
                <span
                  key={`${file.name}-${file.lastModified}`}
                  className="rounded-lg border border-[#b8c4c7] bg-[#eef3fb] px-2.5 py-1 text-xs font-medium text-[#172b2e]"
                >
                  {file.name}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </form>
  );

  if (feedQuery.isLoading) {
    return (
      <div className="space-y-3">
        {composer}
        <div className="overflow-hidden rounded-2xl border border-[#d6dde3] bg-white p-5 shadow-sm">
          <p className="text-sm text-[#7a8e91]">Loading group feed...</p>
        </div>
      </div>
    );
  }

  const posts = feedQuery.data?.data ?? [];

  if (!posts.length) {
    return (
      <div className="space-y-3">
        {composer}
        <div className="overflow-hidden rounded-2xl border border-[#d6dde3] bg-white p-8 text-center shadow-sm">
          <Zap className="mx-auto size-10 text-[#c8d1d7]" />
          <h2 className="mt-3 text-base font-semibold text-[#101820]">No group posts yet</h2>
          <p className="mt-2 text-sm leading-6 text-[#7a8e91]">
            Group posts will appear here when members publish to this group.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {composer}
      {posts.map((post: FeedPost) => (
        <div
          key={post.id}
          className="overflow-hidden rounded-2xl border border-[#d6dde3] bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <Avatar initials={`${post.user.first_name[0]}${post.user.last_name[0]}`} />
              <div>
                <p className="font-semibold text-[#101820]">
                  {post.user.first_name} {post.user.last_name}
                </p>
                <p className="text-xs font-medium uppercase tracking-wide text-[#7a8e91]">
                  Group post
                </p>
              </div>
            </div>
            <button className="text-[#c8d1d7] transition hover:text-[#7a8e91]">
              <MoreVertical className="size-4" />
            </button>
          </div>
          <p className="mt-4 text-sm leading-7 text-[#1f2937]">{post.content}</p>
          {post.images.length ? (
            <div className="mt-4 grid gap-2">
              {post.images.slice(0, 2).map((image) => (
                <img
                  key={image.id}
                  src={image.file_path}
                  alt=""
                  className="max-h-80 w-full rounded-xl border border-[#d6dde3] object-cover"
                />
              ))}
            </div>
          ) : null}
          <div className="mt-4 flex gap-5 border-t border-[#f3f6fb] pt-3 text-sm text-[#7a8e91]">
            <span>{post.stats.reactions} reactions</span>
            <span>{post.stats.comments} comments</span>
          </div>
        </div>
      ))}
    </div>
  );
}

