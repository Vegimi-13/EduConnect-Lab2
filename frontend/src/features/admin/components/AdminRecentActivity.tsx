import { MessageSquare, ScrollText, ThumbsUp, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FeedPost } from "@/features/feed/types/feed.types";

type AdminRecentActivityProps = {
  posts: FeedPost[];
  isLoading: boolean;
  onDeletePost: (postId: number) => void;
};

function getAuthor(post: FeedPost) {
  return `${post.user.first_name} ${post.user.last_name}`.trim() || post.user.email;
}

function formatVisibility(value: string) {
  return value.toLowerCase();
}

export function AdminRecentActivity({
  posts,
  isLoading,
  onDeletePost,
}: AdminRecentActivityProps) {
  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardHeader className="p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <ScrollText className="size-5" />
          Recent Feed Activity
        </h2>
      </CardHeader>
      <CardContent className="space-y-3 px-5 pb-5">
        {isLoading ? (
          <p className="text-sm text-[#4b5563]">Loading activity...</p>
        ) : null}

        {!isLoading && !posts.length ? (
          <p className="text-sm text-[#4b5563]">No recent posts available.</p>
        ) : null}

        {posts.map((post) => (
          <div
            key={post.id}
            className="rounded-md border border-[#d6dde3] bg-[#f8fafc] p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#061f22]">
                  {getAuthor(post)}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-[#4b5563]">
                  {post.content || "Shared a post"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="rounded-md bg-[#edf3fb] px-2.5 py-1 text-xs font-semibold capitalize text-[#073f43]">
                  {formatVisibility(String(post.visibility))}
                </span>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this post?")) {
                      onDeletePost(post.id);
                    }
                  }}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs font-medium text-[#4b5563]">
              <span className="flex items-center gap-1">
                <MessageSquare className="size-3.5" />
                {post.stats.comments} comments
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="size-3.5" />
                {post.stats.reactions} reactions
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
