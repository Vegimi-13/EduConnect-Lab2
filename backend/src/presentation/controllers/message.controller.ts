import { Request, Response, NextFunction } from 'express';
import messagingService from '../../business/services/message.service';
import { CreateConversationDto } from '../../business/dto/Conversation/conversation.dto';
import { CreateMessageDto } from '../../business/dto/Conversation/message.dto';
import followRepository from '../../persistence/repositories/follow.repository';

const messagingController = {

  async createConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const user_id = req.user!.userId;
      const data = CreateConversationDto.parse(req.body);

      // Mutual follow check for private conversations
      if (data.type === 'private' && data.participant_id) {
        const iFollow = await followRepository.findFollow(user_id, data.participant_id);
        const theyFollowMe = await followRepository.findFollow(data.participant_id, user_id);

        const mutual =
          iFollow?.status === 'accepted' && theyFollowMe?.status === 'accepted';

        if (!mutual) {
          return res.status(403).json({
            message: 'You can only message users who follow you back.',
          });
        }
      }

      const conversation = await messagingService.createConversation(user_id, data);
      res.status(201).json(conversation);
    } catch (error) {
      next(error);
    }
  },

  async getMyConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const user_id = req.user!.userId;
      const conversations = await messagingService.getMyConversations(user_id);
      res.status(200).json(conversations);
    } catch (error) {
      next(error);
    }
  },

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const user_id = req.user!.userId;
      const conversation_id = Number(req.params.id);
      const messages = await messagingService.getMessages(user_id, conversation_id);
      res.status(200).json(messages);
    } catch (error) {
      next(error);
    }
  },

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const user_id = req.user!.userId;
      const conversation_id = Number(req.params.id);
      const data = CreateMessageDto.parse(req.body);
      const message = await messagingService.sendMessage(user_id, conversation_id, data);
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  },

  // Returns users that mutually follow the current user — they can be messaged
  async getMutualFollows(req: Request, res: Response, next: NextFunction) {
    try {
      const user_id = req.user!.userId;

      const [following, followers] = await Promise.all([
        followRepository.getFollowing(user_id),
        followRepository.getFollowers(user_id),
      ]);

      const followingIds = new Set(following.map((f) => f.following_id));
      const mutuals = followers
        .filter((f) => followingIds.has(f.follower_id))
        .map((f) => f.follower);

      res.status(200).json(mutuals);
    } catch (error) {
      next(error);
    }
  },
};

export default messagingController;