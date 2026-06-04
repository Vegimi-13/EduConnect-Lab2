import reactionRepository from "../../persistence/repositories/FeedRepositories/reaction.repository";
import { ReactionCreateDtoType } from "../dto/Feed/reactions.dto";
import userRepository from "../../persistence/repositories/user.repository";
import notificationService from "./notification.service";

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
    const targetOwnerId = await reactionRepository.findTargetOwnerId(
      data.target_type,
      data.target_id,
    );

    if (targetOwnerId && targetOwnerId !== user_id) {
      const reactor = await userRepository.findById(user_id);
      const actorName = reactor
        ? `${reactor.first_name} ${reactor.last_name}`
        : "Someone";

      await notificationService.notify({
        user_id: targetOwnerId,
        sender_id: user_id,                // ← fixed: pass sender
        type: data.target_type === "POST" ? "POST_REACTION" : "COMMENT_REACTION",
        title: "New reaction",
        message: `${actorName} reacted with ${data.reaction_type.toLowerCase()} to your ${data.target_type.toLowerCase()}.`,
      });
    }

    return { action: "CREATED", data: created };
  },
};

export default reactionService;