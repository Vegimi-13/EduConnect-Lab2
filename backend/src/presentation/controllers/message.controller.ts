// src/presentation/controllers/messaging.controller.ts
import { Request, Response, NextFunction } from 'express';
import messagingService from '../../business/services/message.service';
import { CreateConversationDto } from '../../business/dto/Conversation/conversation.dto';

const messagingController = {

    async createConversation(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = req.user!.userId;
            const data = CreateConversationDto.parse(req.body);
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

};

export default messagingController;