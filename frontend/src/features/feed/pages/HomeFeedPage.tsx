import {
  Bookmark,
  CornerDownRight,
  Edit3,
  Image,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  PenLine,
  RefreshCw,
  Send,
  Share2,
  Tags,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cloudinaryApi } from "@/lib/cloudinary";
import { useFeedStore } from "../store/feedStore";
import type { FeedComment, FeedPost, FeedScope } from "../types/feed.types";

const EMPTY_COMMENTS: FeedComment[] = [];

function getInitials(firstName?: string, lastName?: string, fallback = "EC") {
  const first = firstName?.[0] ?? "";
  const last = lastName?.[0] ?? "";
  const initials = `${first}${last}`.trim();
  return initials || fallback;
}

function getAuthorName(post: FeedPost) {
  return `${post.user.first_name} ${post.user.last_name}`.trim();
}

function getCommentAuthor(comment: FeedComment) {
  if (comment.user) {
    return `${comment.user.first_name} ${comment.user.last_name}`.trim();
  }
  return "You";
}

function getAuthorMeta(post: FeedPost) {
  if (post.user.profile?.headline) return post.user.profile.headline;
  if (post.group?.name) return post.group.name;
  return post.user.email;
}

function formatPostTime(date: string) {
  const timestamp = new Date(date).getTime();
  if (Number.isNaN(timestamp)) return "";
  const diffInMinutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(date));
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) return String(error.message);
  return fallback;
}

function Avatar({
  label,
  className = "bg-[#0b4f53]",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white ${className}`}
    >
      {label}
    </div>
  );
}

function Composer() {
  const createPost = useFeedStore((state) => state.createPost);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [searchParams] = useSearchParams();
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError("Write something before posting.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const imageUrls = files.length ? await cloudinaryApi.uploadImages(files) : undefined;
      await createPost({ content: trimmedContent, visibility: "PUBLIC", post_type: "TEXT", images: imageUrls });
      setContent("");
      setFiles([]);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "Could not create post."));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleFileChange(selectedFiles: FileList | null) {
    const imageFiles = Array.from(selectedFiles ?? []).filter((f) => f.type.startsWith("image/")).slice(0, 5);
    setFiles(imageFiles);
    setError(null);
  }

  useEffect(() => {
    if (searchParams.get("compose") !== "1") return;
    textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    textareaRef.current?.focus();
  }, [searchParams]);

  return (
    <div id="feed-composer" className="overflow-hidden rounded-2xl border border-[#d0dbe2] bg-white shadow-sm">
      <form onSubmit={handleSubmit}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => handleFileChange(event.target.files)}
        />
        <div className="p-4 pb-3">
          <div className="flex gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#073f43] text-white">
              <PenLine className="size-4" />
            </div>
            <textarea
              ref={textareaRef}
              className="min-h-[72px] flex-1 resize-none rounded-xl border border-[#dce5ec] bg-[#f7fafc] px-3.5 py-2.5 text-sm leading-relaxed text-[#101820] outline-none transition-colors placeholder:text-[#8a9fa3] focus:border-[#073f43] focus:bg-white"
              placeholder="Share an insight or research update..."
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={1000}
            />
          </div>

          {error ? (
            <p className="mt-3 rounded-xl border border-destructive/20 bg-destructive/8 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

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

        <div className="flex items-center justify-between border-t border-[#edf1f4] px-4 py-2.5">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="h-8 rounded-lg px-3 text-xs font-semibold text-[#3d5254] hover:bg-[#edf3fb] hover:text-[#073f43]"
            >
              🌐 Public
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              type="button"
              aria-label="Add image"
              className="size-8 rounded-lg text-[#6a8084] hover:bg-[#edf3fb] hover:text-[#073f43]"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              type="button"
              aria-label="Attach file"
              className="size-8 rounded-lg text-[#6a8084] hover:bg-[#edf3fb] hover:text-[#073f43]"
            >
              <Paperclip className="size-4" />
            </Button>
          </div>
          <Button
            className="h-8 rounded-full bg-[#073f43] px-5 text-xs font-semibold text-white shadow-sm hover:bg-[#062f33] disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function PostImages({ post }: { post: FeedPost }) {
  if (!post.images.length) return null;
  return (
    <div className="mt-3 grid gap-2">
      {post.images.slice(0, 2).map((image) => (
        <img
          key={image.id}
          src={image.file_path}
          alt=""
          className="max-h-80 w-full rounded-xl border border-[#d0dbe2] object-cover"
        />
      ))}
    </div>
  );
}

function SharedPostPreview({ post }: { post: FeedPost }) {
  if (!post.shared_from) return null;
  const author = post.shared_from.user
    ? `${post.shared_from.user.first_name} ${post.shared_from.user.last_name}`.trim()
    : "Original post";
  return (
    <div className="mt-3 rounded-xl border border-[#c8d6dc] bg-[#f3f7fb] p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#5a7a7d]">Shared from</p>
      <p className="mt-1 text-sm font-semibold text-[#101820]">{author}</p>
      {post.shared_from.content ? (
        <p className="mt-1.5 text-sm leading-relaxed text-[#374151]">{post.shared_from.content}</p>
      ) : null}
    </div>
  );
}

function FeedPostCard({ post }: { post: FeedPost }) {
  const reactToPost = useFeedStore((state) => state.reactToPost);
  const toggleBookmark = useFeedStore((state) => state.toggleBookmark);
  const sharePost = useFeedStore((state) => state.sharePost);
  const updatePost = useFeedStore((state) => state.updatePost);
  const deletePost = useFeedStore((state) => state.deletePost);
  const fetchComments = useFeedStore((state) => state.fetchComments);
  const createComment = useFeedStore((state) => state.createComment);
  const comments = useFeedStore((state) => state.commentsByPost[post.id] ?? EMPTY_COMMENTS);
  const isLoadingComments = useFeedStore((state) => state.commentsLoadingByPost[post.id] ?? false);
  const [isActing, setIsActing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(post.content ?? "");
  const [areCommentsOpen, setAreCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);

  const authorName = getAuthorName(post);
  const authorMeta = getAuthorMeta(post);
  const authorInitials = getInitials(post.user.first_name, post.user.last_name, String(post.user.id));

  async function runAction(action: () => Promise<unknown>) {
    setIsActing(true);
    try { await action(); } finally { setIsActing(false); }
  }

  async function handleToggleComments() {
    const nextIsOpen = !areCommentsOpen;
    setAreCommentsOpen(nextIsOpen);
    if (nextIsOpen && !comments.length) await fetchComments(post.id);
  }

  async function handleSaveEdit() {
    const trimmedContent = draftContent.trim();
    if (!trimmedContent) return;
    await runAction(async () => {
      await updatePost(post.id, { content: trimmedContent });
      setIsEditing(false);
      setIsMenuOpen(false);
    });
  }

  async function handleDeletePost() {
    await runAction(async () => { await deletePost(post.id); });
  }

  async function handleCreateComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedComment = commentText.trim();
    if (!trimmedComment) { setCommentError("Write a comment first."); return; }
    setCommentError(null);
    await runAction(async () => {
      await createComment(post.id, { content: trimmedComment });
      setCommentText("");
    });
  }

  async function handleCreateReply(commentId: number) {
    const trimmedReply = replyText.trim();
    if (!trimmedReply) { setCommentError("Write a reply first."); return; }
    setCommentError(null);
    await runAction(async () => {
      await createComment(post.id, { content: trimmedReply, parent_comment_id: commentId });
      setReplyText("");
      setReplyingTo(null);
    });
  }

  const rootComments = comments.filter((c) => !c.parent_comment_id);
  const repliesByParent = comments.reduce<Record<number, FeedComment[]>>((acc, comment) => {
    if (comment.parent_comment_id) {
      acc[comment.parent_comment_id] = [...(acc[comment.parent_comment_id] ?? []), comment];
    }
    return acc;
  }, {});

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d0dbe2] bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="p-5 pb-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Link to={`/profile/${post.user.id}`}>
              <Avatar label={authorInitials} className="bg-[#073f43]" />
            </Link>
            <div>
              <Link
                to={`/profile/${post.user.id}`}
                className="text-sm font-semibold text-[#101820] hover:text-[#073f43] hover:underline"
              >
                {authorName || "EduConnect User"}
              </Link>
              <p className="mt-0.5 text-xs text-[#5a7a7d]">{authorMeta}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="text-xs text-[#8a9fa3]">{formatPostTime(post.created_at)}</span>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="More post actions"
                className="size-7 rounded-lg text-[#8a9fa3] hover:bg-[#f0f5f8] hover:text-[#101820]"
                onClick={() => setIsMenuOpen((v) => !v)}
              >
                <MoreHorizontal className="size-4" />
              </Button>
              {isMenuOpen ? (
                <div className="absolute right-0 top-8 z-20 w-36 overflow-hidden rounded-xl border border-[#d0dbe2] bg-white shadow-lg">
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[#101820] transition-colors hover:bg-[#f0f5f8]"
                    type="button"
                    onClick={() => { setDraftContent(post.content ?? ""); setIsEditing(true); setIsMenuOpen(false); }}
                  >
                    <Edit3 className="size-3.5 text-[#5a7a7d]" />
                    Edit
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/8"
                    type="button"
                    onClick={handleDeletePost}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Body */}
        {isEditing ? (
          <div className="mt-4 rounded-xl border border-[#c8d6dc] bg-[#f7fafc] p-3">
            <textarea
              className="min-h-24 w-full resize-none bg-transparent text-sm leading-relaxed text-[#101820] outline-none"
              value={draftContent}
              onChange={(event) => setDraftContent(event.target.value)}
              maxLength={1000}
            />
            <div className="mt-2.5 flex justify-end gap-2">
              <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs" onClick={() => setIsEditing(false)}>
                <X className="size-3.5" /> Cancel
              </Button>
              <Button size="sm" className="h-8 rounded-lg bg-[#073f43] px-4 text-xs text-white hover:bg-[#062f33]" disabled={isActing} onClick={handleSaveEdit}>
                Save
              </Button>
            </div>
          </div>
        ) : post.content ? (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#1f2937]">
            {post.content}
          </p>
        ) : null}

        {post.categories.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.categories.map((category) => (
              <span
                key={category.id}
                className="rounded-full border border-[#b3d1d4] bg-[#e8f4f4] px-2.5 py-0.5 text-xs font-medium text-[#073f43]"
              >
                {category.name}
              </span>
            ))}
          </div>
        ) : null}

        <SharedPostPreview post={post} />
        <PostImages post={post} />
      </div>

      {/* Footer actions */}
      <div className="mt-4 flex items-center justify-between border-t border-[#edf1f4] px-5 py-2.5">
        <div className="flex items-center gap-0.5">
          <button
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[#e8f4f4] ${
              post.viewer.myReaction ? "text-[#073f43]" : "text-[#5a7a7d]"
            }`}
            type="button"
            disabled={isActing}
            onClick={() => runAction(() => reactToPost(post.id, "LIKE"))}
          >
            <ThumbsUp className={`size-3.5 ${post.viewer.myReaction ? "fill-[#073f43]" : ""}`} />
            {post.stats.reactions}
          </button>
          <button
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[#e8f4f4] ${
              areCommentsOpen ? "text-[#073f43]" : "text-[#5a7a7d]"
            }`}
            type="button"
            onClick={handleToggleComments}
          >
            <MessageSquare className="size-3.5" />
            {post.stats.comments}
          </button>
          <button
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#5a7a7d] transition-colors hover:bg-[#e8f4f4] hover:text-[#073f43]"
            type="button"
            disabled={isActing}
            onClick={() => runAction(() => sharePost(post.id))}
          >
            <Share2 className="size-3.5" />
            Share
          </button>
        </div>
        <button
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[#fff5e6] ${
            post.viewer.isBookmarked ? "text-[#c88736]" : "text-[#8a9fa3] hover:text-[#c88736]"
          }`}
          disabled={isActing}
          onClick={() => runAction(() => toggleBookmark(post.id))}
        >
          <Bookmark className={`size-3.5 ${post.viewer.isBookmarked ? "fill-[#c88736]" : ""}`} />
          {post.viewer.isBookmarked ? "Saved" : "Save"}
        </button>
      </div>

      {/* Comments section */}
      {areCommentsOpen ? (
        <div className="border-t border-[#edf1f4] px-5 py-4">
          <form className="flex gap-3" onSubmit={handleCreateComment}>
            <Avatar label="ME" className="size-8 rounded-full bg-[#c88736] text-[10px]" />
            <div className="flex-1">
              <textarea
                className="min-h-[60px] w-full resize-none rounded-xl border border-[#d0dbe2] bg-[#f7fafc] px-3 py-2 text-sm outline-none transition-colors focus:border-[#073f43] focus:bg-white"
                placeholder="Leave a comment..."
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                maxLength={1000}
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xs text-destructive">{commentError ?? ""}</p>
                <Button size="sm" className="h-7 rounded-full bg-[#073f43] px-4 text-xs text-white hover:bg-[#062f33]" disabled={isActing}>
                  <Send className="size-3" /> Comment
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-4 space-y-3">
            {isLoadingComments ? (
              <p className="text-xs text-muted-foreground">Loading comments...</p>
            ) : rootComments.length ? (
              rootComments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex gap-3">
                    {comment.user ? (
                      <Link to={`/profile/${comment.user.id}`}>
                        <Avatar label={getInitials(comment.user?.first_name, comment.user?.last_name, "ME")} className="size-8 rounded-full bg-[#0b4f53] text-[10px]" />
                      </Link>
                    ) : (
                      <Avatar label="ME" className="size-8 rounded-full bg-[#0b4f53] text-[10px]" />
                    )}
                    <div className="flex-1 rounded-xl bg-[#f3f6fb] px-3.5 py-2.5">
                      <div className="flex items-center justify-between gap-3">
                        {comment.user ? (
                          <Link to={`/profile/${comment.user.id}`} className="text-xs font-semibold text-[#101820] hover:underline">
                            {getCommentAuthor(comment)}
                          </Link>
                        ) : (
                          <p className="text-xs font-semibold text-[#101820]">{getCommentAuthor(comment)}</p>
                        )}
                        <span className="text-[10px] text-[#8a9fa3]">{formatPostTime(comment.created_at)}</span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-[#374151]">{comment.content}</p>
                      <button
                        className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-[#073f43] hover:underline"
                        type="button"
                        onClick={() => { setReplyingTo(comment.id); setReplyText(""); }}
                      >
                        <CornerDownRight className="size-3" /> Reply
                      </button>
                    </div>
                  </div>

                  {(repliesByParent[comment.id] ?? []).map((reply) => (
                    <div key={reply.id} className="ml-11 flex gap-3">
                      {reply.user ? (
                        <Link to={`/profile/${reply.user.id}`}>
                          <Avatar label={getInitials(reply.user?.first_name, reply.user?.last_name, "ME")} className="size-7 rounded-full bg-[#c88736] text-[10px]" />
                        </Link>
                      ) : (
                        <Avatar label="ME" className="size-7 rounded-full bg-[#c88736] text-[10px]" />
                      )}
                      <div className="flex-1 rounded-xl bg-[#fafbfc] px-3.5 py-2.5">
                        <div className="flex items-center justify-between gap-3">
                          {reply.user ? (
                            <Link to={`/profile/${reply.user.id}`} className="text-xs font-semibold text-[#101820] hover:underline">
                              {getCommentAuthor(reply)}
                            </Link>
                          ) : (
                            <p className="text-xs font-semibold text-[#101820]">{getCommentAuthor(reply)}</p>
                          )}
                          <span className="text-[10px] text-[#8a9fa3]">{formatPostTime(reply.created_at)}</span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-[#374151]">{reply.content}</p>
                      </div>
                    </div>
                  ))}

                  {replyingTo === comment.id ? (
                    <div className="ml-11 flex gap-2">
                      <textarea
                        className="min-h-10 flex-1 resize-none rounded-xl border border-[#d0dbe2] bg-[#f7fafc] px-3 py-2 text-xs outline-none transition-colors focus:border-[#073f43]"
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(event) => setReplyText(event.target.value)}
                        maxLength={1000}
                      />
                      <Button
                        size="icon-sm"
                        className="size-8 rounded-xl bg-[#073f43] text-white hover:bg-[#062f33]"
                        disabled={isActing}
                        onClick={() => handleCreateReply(comment.id)}
                        aria-label="Send reply"
                      >
                        <Send className="size-3.5" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No comments yet. Start the discussion.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FeedOverview() {
  const meta = useFeedStore((state) => state.meta);
  const posts = useFeedStore((state) => state.posts);

  return (
    <div className="overflow-hidden rounded-2xl bg-[#073f43] shadow-sm">
      <div className="px-4 pt-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white/60">Feed Overview</h2>
      </div>
      <div className="mt-3 grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 bg-[#062f33]/60">
        <div className="px-2 py-3 text-center">
          <p className="text-base font-bold text-white">{meta?.total ?? 0}</p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/45">Total</p>
        </div>
        <div className="px-2 py-3 text-center">
          <p className="text-base font-bold text-white">{posts.length}</p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/45">Loaded</p>
        </div>
        <div className="px-2 py-3 text-center">
          <p className="text-base font-bold text-white">{meta?.page ?? 1}</p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/45">Page</p>
        </div>
      </div>
    </div>
  );
}

function FeedFilters() {
  const query = useFeedStore((state) => state.query);
  const fetchFeed = useFeedStore((state) => state.fetchFeed);
  const scopes: Array<{ label: string; value: FeedScope }> = [
    { label: "All posts", value: "all" },
    { label: "Following", value: "following" },
    { label: "Mine", value: "mine" },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d0dbe2] bg-white shadow-sm">
      <div className="border-b border-[#edf1f4] px-4 py-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#5a7a7d]">Feed Filter</h2>
      </div>
      <div className="p-2">
        {scopes.map((scope) => {
          const isActive = (query.scope ?? "all") === scope.value;
          return (
            <button
              key={scope.value}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#e8f4f4] text-[#073f43]"
                  : "text-[#374151] hover:bg-[#f3f7fb] hover:text-[#073f43]"
              }`}
              onClick={() => fetchFeed({ scope: scope.value, page: 1 })}
            >
              {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#073f43]" />}
              {scope.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CategoriesPanel() {
  const categories = useFeedStore((state) => state.categories);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d0dbe2] bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#edf1f4] px-4 py-3">
        <Tags className="size-3.5 text-[#073f43]" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#5a7a7d]">Categories</h2>
      </div>
      <div className="p-4">
        {categories.length ? (
          <div className="flex flex-wrap gap-1.5">
            {categories.map((category) => (
              <span
                key={category.id}
                className="cursor-pointer rounded-full border border-[#b3d1d4] bg-[#e8f4f4] px-2.5 py-1 text-xs font-medium text-[#073f43] transition-colors hover:bg-[#d0eaec]"
              >
                {category.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No categories yet.</p>
        )}
      </div>
    </div>
  );
}

function RightRail() {
  return (
    <div className="space-y-4">
      <FeedOverview />
      <FeedFilters />
      <CategoriesPanel />
    </div>
  );
}

function FeedBody() {
  const posts = useFeedStore((state) => state.posts);
  const status = useFeedStore((state) => state.status);
  const error = useFeedStore((state) => state.error);
  const meta = useFeedStore((state) => state.meta);
  const fetchFeed = useFeedStore((state) => state.fetchFeed);
  const fetchNextPage = useFeedStore((state) => state.fetchNextPage);

  if (status === "loading" && posts.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[#d0dbe2] bg-white p-5 shadow-sm">
        <RefreshCw className="size-4 animate-spin text-[#073f43]" />
        <span className="text-sm text-[#5a7a7d]">Loading your feed...</span>
      </div>
    );
  }

  if (status === "error" && posts.length === 0) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-white p-5 shadow-sm">
        <p className="text-sm text-destructive">{error ?? "Could not load feed."}</p>
        <Button className="mt-4 rounded-xl" variant="outline" onClick={() => fetchFeed({ page: 1 })}>
          Try again
        </Button>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="rounded-2xl border border-[#d0dbe2] bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-semibold text-[#101820]">No posts yet</p>
        <p className="mt-1.5 text-sm text-muted-foreground">Share the first insight with your academic network.</p>
      </div>
    );
  }

  return (
    <>
      {posts.map((post) => (
        <FeedPostCard key={post.id} post={post} />
      ))}

      {meta?.hasNextPage ? (
        <div className="flex justify-center pb-4">
          <Button
            variant="outline"
            className="rounded-full border-[#c8d6dc] px-8 text-sm text-[#073f43] hover:border-[#073f43] hover:bg-[#e8f4f4]"
            disabled={status === "loading"}
            onClick={() => fetchNextPage()}
          >
            {status === "loading" ? "Loading..." : "Load more"}
          </Button>
        </div>
      ) : null}
    </>
  );
}

export function HomeFeedPage() {
  const fetchFeed = useFeedStore((state) => state.fetchFeed);
  const fetchCategories = useFeedStore((state) => state.fetchCategories);

  useEffect(() => {
    void fetchFeed({ page: 1 });
    void fetchCategories();
  }, [fetchCategories, fetchFeed]);

  return (
    <AppShell rightRail={<RightRail />}>
      <div className="mx-auto max-w-[42rem] space-y-4 py-5">
        <Composer />
        <FeedBody />
      </div>
    </AppShell>
  );
}