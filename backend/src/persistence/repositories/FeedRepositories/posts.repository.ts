import { prisma } from "../../../database/prismaClients";
import type { Prisma } from "../../../database/generated/client";
import { FeedQueryDtoType } from "../../../business/dto/Feed/posts.dto";

// ─── TYPES ─────────────────────────────────────

interface CreatePostData {
  content?: string | null;
  visibility: string;
  post_type: string;
  group_id?: number;
  share_of_post_id?: number;
  images?: string[];
}

type UpdatePostData = {
  content?: string | null;
  visibility?: string;
};

type SystemPostUpdate = {
  is_deleted?: boolean;
  is_edited?: boolean;
  updated_at?: Date;
};

type FullPostUpdate = UpdatePostData & SystemPostUpdate;

type FeedFilters = FeedQueryDtoType & {
  viewerId: number;
  followingIds: number[];
};

// ─── REPOSITORY ─────────────────────────────────

const postRepository = {
  async create(user_id: number, data: CreatePostData) {
    return prisma.post.create({
      data: {
        user: {
          connect: { id: user_id },
        },

        content: data.content ?? null,
        visibility: data.visibility,
        post_type: data.post_type,

        ...(data.group_id !== undefined && {
          group: {
            connect: { id: data.group_id },
          },
        }),

        ...(data.share_of_post_id !== undefined && {
          shared_from: {
            connect: { id: data.share_of_post_id },
          },
        }),
      },
    });
  },

  async findById(id: number) {
    return prisma.post.findUnique({
      where: { id },
    });
  },

  async findActiveById(id: number) {
    return prisma.post.findFirst({
      where: {
        id,
        is_deleted: false,
      },
    });
  },

  async findGroupById(id: number) {
    return prisma.group.findUnique({
      where: { id },
    });
  },

  async findActiveGroupMembership(group_id: number, user_id: number) {
    return prisma.groupMember.findFirst({
      where: {
        group_id,
        user_id,
        OR: [{ status: null }, { status: "active" }],
      },
    });
  },

  async findAcceptedFollowingIds(user_id: number) {
    const follows = await prisma.follow.findMany({
      where: {
        follower_id: user_id,
        status: "accepted",
      },
      select: {
        following_id: true,
      },
    });

    return follows.map((follow) => follow.following_id);
  },

  async findFeed(filters: FeedFilters) {
    const where = buildFeedWhere(filters);
    const skip = (filters.page - 1) * filters.limit;

    const [posts, total] = await prisma.$transaction([
      prisma.post.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: [{ created_at: "desc" }, { id: "desc" }],
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              profile: {
                select: {
                  headline: true,
                  location: true,
                },
              },
            },
          },
          group: {
            select: {
              id: true,
              name: true,
              visibility: true,
            },
          },
          shared_from: {
            include: {
              user: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                },
              },
            },
          },
          post_categories: {
            include: {
              category: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    const postIds = posts.map((post) => post.id);

    if (postIds.length === 0) {
      return {
        data: [],
        meta: buildFeedMeta(total, filters.page, filters.limit),
      };
    }

    const [commentCounts, reactionCounts, bookmarks, viewerReactions] =
      await prisma.$transaction([
        prisma.comment.groupBy({
          by: ["post_id"],
          where: {
            post_id: { in: postIds },
            is_deleted: false,
          },
          _count: {
            _all: true,
          },
        }),
        prisma.reaction.groupBy({
          by: ["target_id"],
          where: {
            target_type: "POST",
            target_id: { in: postIds },
          },
          _count: {
            _all: true,
          },
        }),
        prisma.bookmark.findMany({
          where: {
            user_id: filters.viewerId,
            post_id: { in: postIds },
          },
          select: {
            post_id: true,
          },
        }),
        prisma.reaction.findMany({
          where: {
            user_id: filters.viewerId,
            target_type: "POST",
            target_id: { in: postIds },
          },
          select: {
            target_id: true,
            reaction_type: true,
          },
        }),
      ]);

    const commentCountByPost = new Map(
      commentCounts.map((item) => [item.post_id, item._count._all]),
    );
    const reactionCountByPost = new Map(
      reactionCounts.map((item) => [item.target_id, item._count._all]),
    );
    const bookmarkedPostIds = new Set(
      bookmarks.map((bookmark) => bookmark.post_id),
    );
    const reactionByPost = new Map(
      viewerReactions.map((reaction) => [
        reaction.target_id,
        reaction.reaction_type,
      ]),
    );

    const data = posts.map((post) => {
      const { post_categories, ...postData } = post;

      return {
        ...postData,
        categories: post_categories.map((postCategory) => postCategory.category),
        stats: {
          comments: commentCountByPost.get(post.id) ?? 0,
          reactions: reactionCountByPost.get(post.id) ?? 0,
        },
        viewer: {
          isBookmarked: bookmarkedPostIds.has(post.id),
          myReaction: reactionByPost.get(post.id) ?? null,
        },
      };
    });

    return {
      data,
      meta: buildFeedMeta(total, filters.page, filters.limit),
    };
  },

  async update(id: number, data: FullPostUpdate) {
    return prisma.post.update({
      where: { id },
      data,
    });
  },

  async softDelete(id: number) {
    return prisma.post.update({
      where: { id },
      data: {
        is_deleted: true,
        updated_at: new Date(),
      },
    });
  },
};

function buildFeedWhere(filters: FeedFilters): Prisma.PostWhereInput {
  const and: Prisma.PostWhereInput[] = [
    { is_deleted: false },
    buildVisibilityWhere(filters.viewerId, filters.followingIds),
  ];

  if (filters.scope === "mine") {
    and.push({ user_id: filters.viewerId });
  }

  if (filters.scope === "following") {
    and.push({ user_id: { in: filters.followingIds } });
  }

  if (filters.authorId !== undefined) {
    and.push({ user_id: filters.authorId });
  }

  if (filters.categoryId !== undefined) {
    and.push({
      post_categories: {
        some: {
          category_id: filters.categoryId,
        },
      },
    });
  }

  if (filters.groupId !== undefined) {
    and.push({ group_id: filters.groupId });
  }

  if (filters.postType !== undefined) {
    and.push({ post_type: filters.postType });
  }

  if (filters.visibility !== undefined) {
    and.push({ visibility: filters.visibility });
  }

  if (filters.search !== undefined) {
    and.push({
      content: {
        contains: filters.search,
        mode: "insensitive",
      },
    });
  }

  return { AND: and };
}

function buildVisibilityWhere(
  viewerId: number,
  followingIds: number[],
): Prisma.PostWhereInput {
  return {
    OR: [
      { visibility: "PUBLIC" },
      { user_id: viewerId },
      {
        AND: [
          { visibility: "PRIVATE" },
          { user_id: { in: followingIds } },
        ],
      },
      {
        AND: [
          { visibility: "GROUP" },
          {
            group: {
              group_members: {
                some: {
                  user_id: viewerId,
                  OR: [{ status: null }, { status: "active" }],
                },
              },
            },
          },
        ],
      },
    ],
  };
}

function buildFeedMeta(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export default postRepository;
