import { prisma } from "../../../database/prismaClients";

// ─── TYPES ─────────────────────────────────────

interface CreatePostData {
  content?: string | null;
  visibility: string;
  post_type: string;
  group_id?: number;
  share_of_post_id?: number;
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

export default postRepository;