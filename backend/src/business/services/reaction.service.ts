import reactionRepository from "../../persistence/repositories/FeedRepositories/reaction.repository";
import { ReactionCreateDtoType } from "../dto/Feed/reactions.dto";

const reactionService = {
  async addReaction(user_id: number, data: ReactionCreateDtoType) {
    const existing = await reactionRepository.findExisting(
      user_id,
      data.target_type,
      data.target_id,
    );

    if (existing) {
      if (existing.reaction_type === data.reaction_type) {
        await reactionRepository.delete(existing.id);
        return { action: "REMOVED", data: null };
      }

      const updated = await reactionRepository.updateReactionType(
        existing.id,
        data.reaction_type,
      );
      return { action: "UPDATED", data: updated };
    }

    const created = await reactionRepository.create(user_id, data);
    return { action: "CREATED", data: created };
  },
};

export default reactionService;
