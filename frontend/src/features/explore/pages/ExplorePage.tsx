import {
  Compass,
  Hash,
  Lock,
  MessageSquare,
  Search,
  Send,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { feedApi } from "@/features/feed/api/feedApi";
import type { FeedPost } from "@/features/feed/types/feed.types";
import { groupsApi } from "@/features/groups/api/groupsApi";
import type { ExploreGroup } from "@/features/groups/types/groups.types";

type ExploreMode = "groups" | "posts";
type GroupVisibilityFilter = "all" | "public" | "private";

const EMPTY_GROUPS: ExploreGroup[] = [];
const EMPTY_POSTS: FeedPost[] = [];

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
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

function getAuthorName(post: FeedPost) {
  return `${post.user.first_name} ${post.user.last_name}`.trim();
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function ExploreHero({
  mode,
  searchDraft,
  onModeChange,
  onSearchDraftChange,
  onSearch,
}: {
  mode: ExploreMode;
  searchDraft: string;
  onModeChange: (mode: ExploreMode) => void;
  onSearchDraftChange: (value: string) => void;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Card className="overflow-hidden border-[#b8c4c7] bg-white">
      <div className="relative bg-[#073f43] px-6 py-7 text-white sm:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,50,52,0.98),rgba(18,104,100,0.78)),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(0,0,0,0.18))]" />
        <div className="absolute right-10 top-0 h-full w-48 border-x border-white/10" />
        <div className="relative max-w-3xl">
          <div className="flex size-11 items-center justify-center rounded-md bg-white/12">
            <Compass className="size-6" />
          </div>
          <h1 className="mt-4 text-3xl font-bold">Explore EduConnect</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/82">
            Discover active academic groups, request access to private spaces, or
            scan recent community posts.
          </p>
        </div>
      </div>

      <CardContent className="space-y-4 p-5">
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={onSearch}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#53676b]" />
            <Input
              className="h-10 border-[#b8c4c7] bg-[#edf3fb] pl-10"
              placeholder="Search groups, research topics, or posts"
              type="search"
              value={searchDraft}
              onChange={(event) => onSearchDraftChange(event.target.value)}
            />
          </div>
          <Button className="h-10 bg-[#073f43] px-5 text-white hover:bg-[#062f33]">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {([
            { value: "groups", label: "Available groups", icon: UsersRound },
            { value: "posts", label: "Posts", icon: MessageSquare },
          ] as const).map((item) => {
            const Icon = item.icon;
            const isActive = mode === item.value;

            return (
              <Button
                key={item.value}
                type="button"
                variant={isActive ? "secondary" : "outline"}
                className={isActive ? "bg-[#edf3fb] text-[#073f43]" : ""}
                onClick={() => onModeChange(item.value)}
              >
                <Icon className="size-4" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function GroupCard({
  group,
  isJoining,
  onJoin,
}: {
  group: ExploreGroup;
  isJoining: boolean;
  onJoin: (groupId: number) => void;
}) {
  const visibility = group.visibility ?? "public";
  const isPrivate = visibility === "private";
  const membership = group.viewer.membership;
  const joinRequest = group.viewer.join_request;
  const isJoined = Boolean(membership);
  const hasPendingRequest = joinRequest?.status === "pending";
  const ownerName = group.owner
    ? `${group.owner.first_name} ${group.owner.last_name}`.trim()
    : "Group owner";
  const actionLabel = isJoined
    ? "Joined"
    : hasPendingRequest
      ? "Request pending"
      : isPrivate
        ? "Request to join"
        : "Join group";

  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-[#073f43] text-sm font-bold text-white">
            {getInitials(group.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-[#061f22]">{group.name}</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#edf3fb] px-2.5 py-1 text-xs font-bold text-[#073f43]">
                {isPrivate ? <Lock className="size-3" /> : <Sparkles className="size-3" />}
                {visibility}
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-[#53676b]">
              Led by {ownerName} - Created {formatDate(group.created_at)}
            </p>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#1f2937]">
              {group.description ??
                "A focused academic group for discussions, resources, and collaboration."}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 rounded-md bg-[#edf3fb] p-2 text-center">
          <div>
            <p className="text-base font-bold text-[#073f43]">{group.counts.members}</p>
            <p className="text-xs text-[#53676b]">Members</p>
          </div>
          <div>
            <p className="text-base font-bold text-[#073f43]">{group.counts.posts}</p>
            <p className="text-xs text-[#53676b]">Posts</p>
          </div>
          <div>
            <p className="text-base font-bold text-[#073f43]">{group.counts.channels}</p>
            <p className="text-xs text-[#53676b]">Channels</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          {isJoined ? (
            <Button asChild variant="outline">
              <Link to="/my-groups">Open in My Groups</Link>
            </Button>
          ) : (
            <Button
              className="bg-[#073f43] text-white hover:bg-[#062f33]"
              disabled={hasPendingRequest || isJoining}
              onClick={() => onJoin(group.id)}
            >
              <Send className="size-4" />
              {isJoining ? "Sending..." : actionLabel}
            </Button>
          )}
          <p className="text-xs text-[#53676b]">
            {isPrivate
              ? "Private groups require owner approval."
              : "Public groups accept members immediately."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function GroupsExplore({
  groups,
  visibilityFilter,
  isLoading,
  error,
  joiningGroupId,
  onVisibilityFilterChange,
  onJoin,
}: {
  groups: ExploreGroup[];
  visibilityFilter: GroupVisibilityFilter;
  isLoading: boolean;
  error: unknown;
  joiningGroupId: number | null;
  onVisibilityFilterChange: (filter: GroupVisibilityFilter) => void;
  onJoin: (groupId: number) => void;
}) {
  const filteredGroups = useMemo(() => {
    const availableGroups = groups.filter((group) => !group.viewer.membership);

    if (visibilityFilter === "all") {
      return availableGroups;
    }

    return availableGroups.filter(
      (group) => (group.visibility ?? "public") === visibilityFilter
    );
  }, [groups, visibilityFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#061f22]">Groups to join</h2>
          <p className="mt-1 text-sm text-[#53676b]">
            Public groups join immediately. Private groups send a request.
          </p>
        </div>
        <div className="flex gap-2">
          {(["all", "public", "private"] as const).map((filter) => (
            <Button
              key={filter}
              type="button"
              variant={visibilityFilter === filter ? "secondary" : "outline"}
              className={
                visibilityFilter === filter ? "bg-[#edf3fb] text-[#073f43]" : ""
              }
              onClick={() => onVisibilityFilterChange(filter)}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      {error ? (
        <Card className="border-destructive/20 bg-white">
          <CardContent className="p-5 text-sm text-destructive">
            {getErrorMessage(error, "Could not load groups.")}
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <Card className="border-[#b8c4c7] bg-white">
          <CardContent className="p-5 text-sm text-[#53676b]">
            Finding groups...
          </CardContent>
        </Card>
      ) : filteredGroups.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              isJoining={joiningGroupId === group.id}
              onJoin={onJoin}
            />
          ))}
        </div>
      ) : (
        <Card className="border-[#b8c4c7] bg-white">
          <CardContent className="p-8 text-center">
            <UsersRound className="mx-auto size-10 text-[#53676b]" />
            <h3 className="mt-4 text-lg font-semibold">No groups found</h3>
            <p className="mt-2 text-sm text-[#53676b]">
              Try a broader search or switch the visibility filter.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PostCard({ post }: { post: FeedPost }) {
  const initials = `${post.user.first_name[0] ?? ""}${post.user.last_name[0] ?? ""}`;

  return (
    <Card className="border-[#b8c4c7] bg-white">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#0b5557] text-xs font-bold text-white">
            {initials || "EC"}
          </div>
          <div className="min-w-0">
            <p className="font-semibold">{getAuthorName(post)}</p>
            <p className="text-xs text-[#53676b]">
              {post.group?.name ?? post.user.email} - {formatDate(post.created_at)}
            </p>
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#1f2937]">
          {post.content}
        </p>

        <div className="mt-4 flex flex-wrap gap-4 border-t border-[#d6dde3] pt-3 text-sm text-[#53676b]">
          <span>{post.stats.reactions} reactions</span>
          <span>{post.stats.comments} comments</span>
          {post.group ? (
            <span className="inline-flex items-center gap-1">
              <Hash className="size-3.5" />
              {post.group.name}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function PostsExplore({
  posts,
  isLoading,
  error,
}: {
  posts: FeedPost[];
  isLoading: boolean;
  error: unknown;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-[#061f22]">Community posts</h2>
        <p className="mt-1 text-sm text-[#53676b]">
          Search across public posts and visible group discussions.
        </p>
      </div>

      {error ? (
        <Card className="border-destructive/20 bg-white">
          <CardContent className="p-5 text-sm text-destructive">
            {getErrorMessage(error, "Could not load posts.")}
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <Card className="border-[#b8c4c7] bg-white">
          <CardContent className="p-5 text-sm text-[#53676b]">
            Loading posts...
          </CardContent>
        </Card>
      ) : posts.length ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <Card className="border-[#b8c4c7] bg-white">
          <CardContent className="p-8 text-center">
            <MessageSquare className="mx-auto size-10 text-[#53676b]" />
            <h3 className="mt-4 text-lg font-semibold">No posts found</h3>
            <p className="mt-2 text-sm text-[#53676b]">
              Try searching for a class, topic, or research area.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ExploreRightRail({ groups }: { groups: ExploreGroup[] }) {
  const openGroups = groups.filter((group) => (group.visibility ?? "public") === "public");
  const privateGroups = groups.filter((group) => group.visibility === "private");

  return (
    <div className="space-y-5">
      <Card className="border-[#b8c4c7] bg-white">
        <CardHeader className="p-4">
          <h2 className="text-lg font-semibold">Discovery</h2>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
          <div className="rounded-md bg-[#edf3fb] p-3">
            <p className="text-2xl font-bold text-[#073f43]">{groups.length}</p>
            <p className="text-xs font-medium text-[#53676b]">Groups found</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-md border border-[#d6dde3] p-3">
              <p className="font-bold">{openGroups.length}</p>
              <p className="text-xs text-[#53676b]">Public</p>
            </div>
            <div className="rounded-md border border-[#d6dde3] p-3">
              <p className="font-bold">{privateGroups.length}</p>
              <p className="text-xs text-[#53676b]">Private</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#b8c4c7] bg-white">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#ffc85c] text-[#6b4a05]">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Explore tip</h2>
              <p className="mt-1 text-xs leading-5 text-[#53676b]">
                Use Groups when you want a community to join, and Posts when you
                want to scan what people are discussing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ExplorePage() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<ExploreMode>("groups");
  const [searchDraft, setSearchDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] =
    useState<GroupVisibilityFilter>("all");
  const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null);

  const groupsQuery = useQuery({
    queryKey: ["explore", "groups", searchQuery],
    queryFn: () => groupsApi.searchGroups({ q: searchQuery, limit: 30 }),
    retry: false,
  });
  const postsQuery = useQuery({
    queryKey: ["explore", "posts", searchQuery],
    queryFn: () => feedApi.getFeed({ search: searchQuery, limit: 12 }),
    retry: false,
    enabled: mode === "posts",
  });
  const joinMutation = useMutation({
    mutationFn: groupsApi.joinGroup,
    onMutate: (groupId) => {
      setJoiningGroupId(groupId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["explore", "groups"] });
      void queryClient.invalidateQueries({ queryKey: ["groups", "my"] });
    },
    onSettled: () => {
      setJoiningGroupId(null);
    },
  });

  const groups = groupsQuery.data ?? EMPTY_GROUPS;
  const posts = postsQuery.data?.data ?? EMPTY_POSTS;

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchQuery(searchDraft.trim());
  }

  return (
    <AppShell activeItem="Explore" rightRail={<ExploreRightRail groups={groups} />}>
      <div className="mx-auto max-w-[64rem] space-y-5">
        <ExploreHero
          mode={mode}
          searchDraft={searchDraft}
          onModeChange={setMode}
          onSearchDraftChange={setSearchDraft}
          onSearch={handleSearch}
        />

        {joinMutation.error ? (
          <Card className="border-destructive/20 bg-white">
            <CardContent className="p-4 text-sm text-destructive">
              {getErrorMessage(joinMutation.error, "Could not join this group.")}
            </CardContent>
          </Card>
        ) : null}

        {mode === "groups" ? (
          <GroupsExplore
            groups={groups}
            visibilityFilter={visibilityFilter}
            isLoading={groupsQuery.isLoading}
            error={groupsQuery.error}
            joiningGroupId={joiningGroupId}
            onVisibilityFilterChange={setVisibilityFilter}
            onJoin={(groupId) => joinMutation.mutate(groupId)}
          />
        ) : (
          <PostsExplore
            posts={posts}
            isLoading={postsQuery.isLoading}
            error={postsQuery.error}
          />
        )}
      </div>
    </AppShell>
  );
}
