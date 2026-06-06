import {
  Bookmark,
  BookOpen,
  CornerDownRight,
  Edit3,
  Image,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
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
  if (post.user.profile?.headline) {
    return post.user.profile.headline;
  }

  if (post.group?.name) {
    return post.group.name;
  }

  return post.user.email;
}

function formatPostTime(date: string) {
  const timestamp = new Date(date).getTime();

  if (Number.isNaN(timestamp)) {
    return "";
  }

  const diffInMinutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

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
      className={`flex size-10 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white shadow-sm ${className}`}
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
      const imageUrls = files.length
        ? await cloudinaryApi.uploadImages(files)
        : undefined;

      await createPost({
        content: trimmedContent,
        visibility: "PUBLIC",
        post_type: "TEXT",
        images: imageUrls,
      });
      setContent("");
      setFiles([]);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "Could not create post."));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleFileChange(selectedFiles: FileList | null) {
    const imageFiles = Array.from(selectedFiles ?? [])
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 5);

    setFiles(imageFiles);
    setError(null);
  }

  useEffect(() => {
    if (searchParams.get("compose") !== "1") {
      return;
    }

    textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    textareaRef.current?.focus();
  }, [searchParams]);

  return (
    <Card id="feed-composer" className="border-[#b8c4c7] bg-white">
      <form onSubmit={handleSubmit}>
        <CardContent className="p-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => handleFileChange(event.target.files)}
          />

          <div className="flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#e6eef1]">
              <BookOpen className="size-5 text-[#53676b]" />
            </div>
            <textarea
              ref={textareaRef}
              className="min-h-20 flex-1 resize-none bg-transparent pt-1.5 text-base outline-none placeholder:text-[#6b7280]"
              placeholder="Share an insight or research update..."
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={1000}
            />
          </div>

          {error ? (
            <p className="mt-3 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {files.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {files.map((file) => (
                <span
                  key={`${file.name}-${file.lastModified}`}
                  className="rounded-md border border-[#b8c4c7] bg-[#eef3fb] px-2.5 py-1 text-xs font-medium text-[#172b2e]"
                >
                  {file.name}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-3 flex items-center justify-between border-t border-[#c8d1d4] pt-3">
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                className="bg-[#eef3fb]"
              >
                Public
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                type="button"
                aria-label="Add image"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                type="button"
                aria-label="Attach file"
              >
                <Paperclip className="size-4" />
              </Button>
            </div>
            <Button
              className="h-9 bg-[#073f43] px-6 text-sm text-white hover:bg-[#062f33]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Uploading..." : "Post"}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}

function PostImages({ post }: { post: FeedPost }) {
  if (!post.images.length) {
    return null;
  }

  return (
    <div className="mt-4 grid gap-2">
      {post.images.slice(0, 2).map((image) => (
        <img
          key={image.id}
          src={image.file_path}
          alt=""
          className="max-h-80 w-full rounded-md border border-[#b8c4c7] object-cover"
        />
      ))}
    </div>
  );
}

function SharedPostPreview({ post }: { post: FeedPost }) {
  if (!post.shared_from) {
    return null;
  }

  const author = post.shared_from.user
    ? `${post.shared_from.user.first_name} ${post.shared_from.user.last_name}`.trim()
    : "Original post";

  return (
    <div className="mt-4 rounded-md border border-[#c8d1d7] bg-[#f6f8fb] p-3">
      <p className="text-xs font-bold uppercase text-[#53676b]">Shared from</p>
      <p className="mt-1 text-sm font-semibold">{author}</p>
      {post.shared_from.content ? (
        <p className="mt-2 text-sm leading-6 text-[#1f2937]">
          {post.shared_from.content}
        </p>
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
  const comments = useFeedStore(
    (state) => state.commentsByPost[post.id] ?? EMPTY_COMMENTS
  );
  const isLoadingComments = useFeedStore(
    (state) => state.commentsLoadingByPost[post.id] ?? false
  );
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
  const authorInitials = getInitials(
    post.user.first_name,
    post.user.last_name,
    String(post.user.id)
  );

  async function runAction(action: () => Promise<unknown>) {
    setIsActing(true);

    try {
      await action();
    } finally {
      setIsActing(false);
    }
  }

  async function handleToggleComments() {
    const nextIsOpen = !areCommentsOpen;
    setAreCommentsOpen(nextIsOpen);

    if (nextIsOpen && !comments.length) {
      await fetchComments(post.id);
    }
  }

  async function handleSaveEdit() {
    const trimmedContent = draftContent.trim();

    if (!trimmedContent) {
      return;
    }

    await runAction(async () => {
      await updatePost(post.id, { content: trimmedContent });
      setIsEditing(false);
      setIsMenuOpen(false);
    });
  }

  async function handleDeletePost() {
    await runAction(async () => {
      await deletePost(post.id);
    });
  }

  async function handleCreateComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedComment = commentText.trim();

    if (!trimmedComment) {
      setCommentError("Write a comment first.");
      return;
    }

    setCommentError(null);

    await runAction(async () => {
      await createComment(post.id, { content: trimmedComment });
      setCommentText("");
    });
  }

  async function handleCreateReply(commentId: number) {
    const trimmedReply = replyText.trim();

    if (!trimmedReply) {
      setCommentError("Write a reply first.");
      return;
    }

    setCommentError(null);

    await runAction(async () => {
      await createComment(post.id, {
        content: trimmedReply,
        parent_comment_id: commentId,
      });
      setReplyText("");
      setReplyingTo(null);
    });
  }

  const rootComments = comments.filter((comment) => !comment.parent_comment_id);
  const repliesByParent = comments.reduce<Record<number, FeedComment[]>>(
    (accumulator, comment) => {
      if (comment.parent_comment_id) {
        accumulator[comment.parent_comment_id] = [
          ...(accumulator[comment.parent_comment_id] ?? []),
          comment,
        ];
      }

      return accumulator;
    },
    {}
  );

  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Link to={`/profile/${post.user.id}`}>
              <Avatar label={authorInitials} />
            </Link>
            <div>
              <Link
                to={`/profile/${post.user.id}`}
                className="text-base font-semibold leading-tight text-[#101820] hover:underline"
              >
                {authorName || "EduConnect User"}
              </Link>
              <p className="mt-1 text-xs font-bold uppercase text-[#173638]">
                {authorMeta}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#283436]">
              {formatPostTime(post.created_at)}
            </span>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="More post actions"
                onClick={() => setIsMenuOpen((value) => !value)}
              >
                <MoreHorizontal className="size-4" />
              </Button>

              {isMenuOpen ? (
                <div className="absolute right-0 top-8 z-20 w-36 rounded-md border border-[#b8c4c7] bg-white p-1 shadow-lg">
                  <button
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-[#edf3fb]"
                    type="button"
                    onClick={() => {
                      setDraftContent(post.content ?? "");
                      setIsEditing(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    <Edit3 className="size-4" />
                    Edit
                  </button>
                  <button
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                    type="button"
                    onClick={handleDeletePost}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="mt-4 rounded-md border border-[#b8c4c7] bg-[#f8fafc] p-3">
            <textarea
              className="min-h-24 w-full resize-none bg-transparent text-sm leading-7 outline-none"
              value={draftContent}
              onChange={(event) => setDraftContent(event.target.value)}
              maxLength={1000}
            />
            <div className="mt-3 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                <X className="size-4" />
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-[#073f43] text-white hover:bg-[#062f33]"
                disabled={isActing}
                onClick={handleSaveEdit}
              >
                Save
              </Button>
            </div>
          </div>
        ) : post.content ? (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#111827]">
            {post.content}
          </p>
        ) : null}

        {post.categories.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.categories.map((category) => (
              <span
                key={category.id}
                className="rounded-full border border-[#b8c4c7] bg-[#eef3f6] px-2.5 py-0.5 text-xs font-medium text-[#172b2e]"
              >
                {category.name}
              </span>
            ))}
          </div>
        ) : null}

        <SharedPostPreview post={post} />
        <PostImages post={post} />

        <div className="mt-4 flex items-center justify-between border-t border-[#c8d1d4] pt-3">
          <div className="flex items-center gap-6 text-[#152527]">
            <button
              className={`flex items-center gap-2 text-sm font-medium ${
                post.viewer.myReaction ? "text-[#0b5557]" : ""
              }`}
              type="button"
              disabled={isActing}
              onClick={() => runAction(() => reactToPost(post.id, "LIKE"))}
            >
              <ThumbsUp className="size-4" />
              {post.stats.reactions}
            </button>
            <button
              className="flex items-center gap-2 text-sm font-medium"
              type="button"
              onClick={handleToggleComments}
            >
              <MessageSquare className="size-4" />
              {post.stats.comments}
            </button>
            <button
              className="flex items-center gap-2 text-sm font-medium"
              type="button"
              disabled={isActing}
              onClick={() => runAction(() => sharePost(post.id))}
            >
              <Share2 className="size-4" />
              Share
            </button>
          </div>
          <Button
            variant="ghost"
            className={
              post.viewer.isBookmarked
                ? "text-[#8a5a00] hover:text-[#6f4700]"
                : "text-[#53676b]"
            }
            size="sm"
            disabled={isActing}
            onClick={() => runAction(() => toggleBookmark(post.id))}
          >
            <Bookmark className="size-4" />
            {post.viewer.isBookmarked ? "Saved" : "Save"}
          </Button>
        </div>

        {areCommentsOpen ? (
          <div className="mt-4 border-t border-[#c8d1d4] pt-4">
            <form className="flex gap-3" onSubmit={handleCreateComment}>
              <Avatar label="ME" className="size-8 rounded-full bg-[#c88736]" />
              <div className="flex-1">
                <textarea
                  className="min-h-16 w-full resize-none rounded-md border border-[#b8c4c7] bg-white px-3 py-2 text-sm outline-none focus:border-[#0b5557]"
                  placeholder="Leave a comment..."
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  maxLength={1000}
                />
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-xs text-destructive">
                    {commentError ?? ""}
                  </p>
                  <Button
                    size="sm"
                    className="bg-[#073f43] text-white hover:bg-[#062f33]"
                    disabled={isActing}
                  >
                    <Send className="size-4" />
                    Comment
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-4 space-y-4">
              {isLoadingComments ? (
                <p className="text-sm text-muted-foreground">Loading comments...</p>
              ) : rootComments.length ? (
                rootComments.map((comment) => (
                  <div key={comment.id} className="space-y-3">
                    <div className="flex gap-3">
                      {comment.user ? (
                        <Link to={`/profile/${comment.user.id}`}>
                          <Avatar
                            label={getInitials(
                              comment.user?.first_name,
                              comment.user?.last_name,
                              "ME"
                            )}
                            className="size-8 rounded-full bg-[#0b4f53]"
                          />
                        </Link>
	                      ) : (
	                        <Avatar
	                          label="ME"
	                          className="size-8 rounded-full bg-[#0b4f53]"
	                        />
	                      )}
                      <div className="flex-1 rounded-md bg-[#f3f6fb] px-3 py-2">
                        <div className="flex items-center justify-between gap-3">
                          {comment.user ? (
                            <Link
                              to={`/profile/${comment.user.id}`}
                              className="text-sm font-semibold hover:underline"
                            >
                              {getCommentAuthor(comment)}
                            </Link>
                          ) : (
                            <p className="text-sm font-semibold">
                              {getCommentAuthor(comment)}
                            </p>
                          )}
                          <span className="text-xs text-[#53676b]">
                            {formatPostTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm leading-6">{comment.content}</p>
                        <button
                          className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#0b5557]"
                          type="button"
                          onClick={() => {
                            setReplyingTo(comment.id);
                            setReplyText("");
                          }}
                        >
                          <CornerDownRight className="size-3" />
                          Reply
                        </button>
                      </div>
                    </div>

                    {(repliesByParent[comment.id] ?? []).map((reply) => (
                      <div key={reply.id} className="ml-11 flex gap-3">
                        {reply.user ? (
                          <Link to={`/profile/${reply.user.id}`}>
                            <Avatar
                              label={getInitials(
                                reply.user?.first_name,
                                reply.user?.last_name,
                                "ME"
                              )}
                              className="size-7 rounded-full bg-[#d8a44a]"
                            />
                          </Link>
	                        ) : (
	                          <Avatar
	                            label="ME"
	                            className="size-7 rounded-full bg-[#d8a44a]"
	                          />
	                        )}
                        <div className="flex-1 rounded-md bg-[#f8fafc] px-3 py-2">
                          <div className="flex items-center justify-between gap-3">
                            {reply.user ? (
                              <Link
                                to={`/profile/${reply.user.id}`}
                                className="text-sm font-semibold hover:underline"
                              >
                                {getCommentAuthor(reply)}
                              </Link>
                            ) : (
                              <p className="text-sm font-semibold">
                                {getCommentAuthor(reply)}
                              </p>
                            )}
                            <span className="text-xs text-[#53676b]">
                              {formatPostTime(reply.created_at)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm leading-6">{reply.content}</p>
                        </div>
                      </div>
                    ))}

                    {replyingTo === comment.id ? (
                      <div className="ml-11 flex gap-2">
                        <textarea
                          className="min-h-12 flex-1 resize-none rounded-md border border-[#b8c4c7] px-3 py-2 text-sm outline-none focus:border-[#0b5557]"
                          placeholder="Write a reply..."
                          value={replyText}
                          onChange={(event) => setReplyText(event.target.value)}
                          maxLength={1000}
                        />
                        <Button
                          size="icon-sm"
                          className="bg-[#073f43] text-white hover:bg-[#062f33]"
                          disabled={isActing}
                          onClick={() => handleCreateReply(comment.id)}
                          aria-label="Send reply"
                        >
                          <Send className="size-4" />
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No comments yet. Start the discussion.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function FeedOverview() {
  const meta = useFeedStore((state) => state.meta);
  const posts = useFeedStore((state) => state.posts);

  return (
    <Card className="border-[#062f33] bg-[#0b5557] text-white">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold">Feed Overview</h2>
        <div className="mt-4 grid grid-cols-3 rounded-md bg-[#08484a] py-2.5 text-center">
          <div>
            <p className="text-sm font-bold">{meta?.total ?? 0}</p>
            <p className="text-xs uppercase text-white/55">Total</p>
          </div>
          <div className="border-x border-white/10">
            <p className="text-sm font-bold">{posts.length}</p>
            <p className="text-xs uppercase text-white/55">Loaded</p>
          </div>
          <div>
            <p className="text-sm font-bold">{meta?.page ?? 1}</p>
            <p className="text-xs uppercase text-white/55">Page</p>
          </div>
        </div>
      </CardContent>
    </Card>
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
    <Card className="border-[#b8c4c7] bg-white">
      <CardHeader className="p-4">
        <h2 className="text-lg font-semibold">Feed Filter</h2>
      </CardHeader>
      <CardContent className="space-y-2 px-4 pb-4">
        {scopes.map((scope) => {
          const isActive = (query.scope ?? "all") === scope.value;

          return (
            <Button
              key={scope.value}
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start ${
                isActive ? "bg-[#edf3fb] text-[#073f43]" : ""
              }`}
              onClick={() => fetchFeed({ scope: scope.value, page: 1 })}
            >
              {scope.label}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function CategoriesPanel() {
  const categories = useFeedStore((state) => state.categories);

  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardHeader className="p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Tags className="size-5" />
          Categories
        </h2>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {categories.length ? (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category.id}
                className="rounded-md border border-[#b8c4c7] bg-[#dceaff] px-3 py-2 text-sm text-[#1f2937]"
              >
                {category.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No categories yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

function RightRail() {
  return (
    <div className="space-y-5">
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
      <Card className="border-[#b8c4c7] bg-white">
        <CardContent className="flex items-center gap-3 p-5 text-sm text-[#53676b]">
          <RefreshCw className="size-4 animate-spin" />
          Loading your feed...
        </CardContent>
      </Card>
    );
  }

  if (status === "error" && posts.length === 0) {
    return (
      <Card className="border-destructive/30 bg-white">
        <CardContent className="p-5">
          <p className="text-sm text-destructive">
            {error ?? "Could not load feed."}
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => fetchFeed({ page: 1 })}
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!posts.length) {
    return (
      <Card className="border-[#b8c4c7] bg-white">
        <CardContent className="p-5">
          <h2 className="text-base font-semibold">No posts yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Share the first insight with your academic network.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {posts.map((post) => (
        <FeedPostCard key={post.id} post={post} />
      ))}

      {meta?.hasNextPage ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
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
      <div className="mx-auto max-w-[42rem] space-y-4">
        <Composer />
        <FeedBody />
      </div>
    </AppShell>
  );
}
