// src/business/services/messaging.service.ts
import messagingRepository from '../../persistence/repositories/message.repository';
import auditLogsRepository from '../../persistence/repositories/auditLogs.repository';
import { CreateConversationDtoType } from '../dto/Conversation/conversation.dto';
import { CreateMessageDtoType, UpdateMessageDtoType } from '../dto/Conversation/message.dto';

const messagingService = {


    async createConversation(user_id: number, data: CreateConversationDtoType) {
        if (data.type === 'private') {
            if (!data.participant_id) throw new Error('participant_id is required for private conversations');

            // Check if a private conversation already exists between these two users
            const conversations = await messagingRepository.findConversationsByUserId(user_id);
            const existing = conversations.find(c =>
                c.type === 'private' &&
                c.conversation_participants.some(p => p.user_id === data.participant_id)
            );
            if (existing) throw new Error('Private conversation already exists with this user');
        }

        if (data.type === 'channel' && !data.group_channel_id) {
            throw new Error('group_channel_id is required for channel conversations');
        }

        return await messagingRepository.createConversation(user_id, data);
    },

    async getMyConversations(user_id: number) {
        return await messagingRepository.findConversationsByUserId(user_id);
    },


    async getMessages(user_id: number, conversation_id: number) {
        const isParticipant = await messagingRepository.isParticipant(conversation_id, user_id);
        if (!isParticipant) throw new Error('You are not a participant of this conversation');

        return await messagingRepository.findMessagesByConversationId(conversation_id);
    },

    async sendMessage(user_id: number, conversation_id: number, data: CreateMessageDtoType) {
        const isParticipant = await messagingRepository.isParticipant(conversation_id, user_id);
        if (!isParticipant) throw new Error('You are not a participant of this conversation');

        return await messagingRepository.createMessage(conversation_id, user_id, data);
    },

    async updateMessage(user_id: number, message_id: number, data: UpdateMessageDtoType) {
        const message = await messagingRepository.findMessageById(message_id);
        if (!message) throw new Error('Message not found');
        if (message.sender_id !== user_id) throw new Error('You can only edit your own messages');
        if (message.is_deleted) throw new Error('Cannot edit a deleted message');

        const oldValue = message ? JSON.stringify(message) : null;
        const updated = await messagingRepository.updateMessage(message_id, data);

        await auditLogsRepository.log({
            action: 'UPDATE_MESSAGE',
            user_id,
            entity: 'message',
            entity_id: message_id,
            old_value: oldValue,
            new_value: updated ? JSON.stringify(updated) : null,
            ip_address: null,
        });

        return updated;
    },

    async deleteMessage(user_id: number, message_id: number) {
        const message = await messagingRepository.findMessageById(message_id);
        if (!message) throw new Error('Message not found');
        if (message.sender_id !== user_id) throw new Error('You can only delete your own messages');
        if (message.is_deleted) throw new Error('Message already deleted');

        const oldValue = message ? JSON.stringify(message) : null;
        const deleted = await messagingRepository.deleteMessage(message_id);

        await auditLogsRepository.log({
            action: 'DELETE_MESSAGE',
            user_id,
            entity: 'message',
            entity_id: message_id,
            old_value: oldValue,
            new_value: deleted ? JSON.stringify(deleted) : null,
            ip_address: null,
        });

        return deleted;
    },

    async markAsRead(user_id: number, message_id: number) {
        const message = await messagingRepository.findMessageById(message_id);
        if (!message) throw new Error('Message not found');

        const isParticipant = await messagingRepository.isParticipant(message.conversation_id, user_id);
        if (!isParticipant) throw new Error('You are not a participant of this conversation');

        return await messagingRepository.markMessageAsRead(message_id, user_id);
    },

};

export default messagingService;