import { prisma } from "../../../database/prismaClients";

const bookmarkRepository = {
  // ─── CREATE BOOKMARK ─────────────────────
  async create(user_id: number, post_id: number) {
    return prisma.bookmark.create({
      data: {
        user: {
          connect: { id: user_id },
        },
        post: {
          connect: { id: post_id },
        },
      },
    });
  },

  // ─── FIND EXISTING (optional but useful) ─
  async find(user_id: number, post_id: number) {
    return prisma.bookmark.findUnique({
      where: {
        user_id_post_id: {
          user_id,
          post_id,
        },
      },
    });
  },

  // ─── DELETE BOOKMARK ─────────────────────
  async delete(user_id: number, post_id: number) {
    return prisma.bookmark.delete({
      where: {
        user_id_post_id: {
          user_id,
          post_id,
        },
      },
    });
  },
};

export default bookmarkRepository;