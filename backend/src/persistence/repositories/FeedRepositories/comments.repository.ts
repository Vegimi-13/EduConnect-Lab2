import { prisma } from "../../../database/prismaClients";

// ─── TYPES ─────────────────────────────────────

interface CreateCommentData {
  content: string;
  parent_comment_id?: number;
}

type UpdateCommentData = {
  content?: string;
  is_edited?: boolean;
  is_deleted?: boolean;
  updated_at?: Date;
};

// ─── REPOSITORY ─────────────────────────────────

const commentRepository = {
  // ─── CREATE ─────────────────────────────
  async create(user_id: number, post_id: number, data: CreateCommentData) {
    return prisma.comment.create({
      data: {
        content: data.content,

        user: {
          connect: { id: user_id },
        },

        post: {
          connect: { id: post_id },
        },

        ...(data.parent_comment_id !== undefined && {
          parent_comment: {
            connect: { id: data.parent_comment_id },
          },
        }),
      },
    });
  },

  // ─── FIND BY ID ─────────────────────────
  async findById(id: number) {
    return prisma.comment.findUnique({
      where: { id },
    });
  },

  // ─── FIND ACTIVE (NOT DELETED) ──────────
  async findActiveById(id: number) {
    return prisma.comment.findFirst({
      where: {
        id,
        is_deleted: false,
      },
    });
  },

  // ─── UPDATE ─────────────────────────────
  async update(id: number, data: UpdateCommentData) {
    return prisma.comment.update({
      where: { id },
      data,
    });
  },

  // ─── SOFT DELETE ────────────────────────
  async softDelete(id: number) {
    return prisma.comment.update({
      where: { id },
      data: {
        is_deleted: true,
        updated_at: new Date(),
      },
    });
  },
};

export default commentRepository;