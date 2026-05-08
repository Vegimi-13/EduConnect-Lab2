import { prisma } from "../../../database/prismaClients";
import type { TargetType, ReactionType } from "../../../shared/constants/enum";

interface CreateReactionData {
  target_type: TargetType;
  target_id: number;
  reaction_type: ReactionType;
}

const reactionRepository = {
  async findById(id: number) {
    return prisma.reaction.findUnique({
      where: { id },
    });
  },

  async findExisting(
    user_id: number,
    target_type: TargetType,
    target_id: number,
  ) {
    return prisma.reaction.findFirst({
      where: {
        user_id,
        target_type,
        target_id,
      },
    });
  },

  async create(user_id: number, data: CreateReactionData) {
    return prisma.reaction.create({
      data: {
        user_id,
        ...data,
      },
    });
  },

  async updateReactionType(id: number, reaction_type: ReactionType) {
    return prisma.reaction.update({
      where: { id },
      data: { reaction_type },
    });
  },

  async isReactionOwnerByUser(id: number, user_id: number) {
    const reaction = await prisma.reaction.findFirst({
      where: { id, user_id },
    });

    return !!reaction;
  },

  async delete(id: number) {
    return prisma.reaction.delete({
      where: { id },
    });
  },

  async findTargetOwnerId(target_type: string, target_id: number) {
    if (target_type === "POST") {
      const post = await prisma.post.findUnique({
        where: { id: target_id },
        select: { user_id: true },
      });

      return post?.user_id ?? null;
    }

    if (target_type === "COMMENT") {
      const comment = await prisma.comment.findUnique({
        where: { id: target_id },
        select: { user_id: true },
      });

      return comment?.user_id ?? null;
    }

    return null;
  },
};

export default reactionRepository;
