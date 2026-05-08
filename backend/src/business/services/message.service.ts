// src/business/services/messaging.service.ts
import messagingRepository from '../../persistence/repositories/message.repository';
import auditLogsRepository from '../../persistence/repositories/auditLogs.repository';
import { CreateConversationDtoType } from '../dto/Conversation/conversation.dto';
import { CreateMessageDtoType, UpdateMessageDtoType } from '../dto/Conversation/message.dto';
import userRepository from '../../persistence/repositories/user.repository';
import notificationService from './notification.service';

const messagingService = {


    async createConversation(user_id: number, data: CreateConversationDtoType) {
        if (data.type === 'private') {
            if (!data.participant_id) throw new Error('participant_id is required for private conversations');
            if (data.participant_id === user_id) throw new Error('You cannot create a private conversation with yourself');

            // Check if a private conversation already exists between these two users
            const conversations = await messagingRepository.findConversationsByUserId(user_id);
            const existing = conversations.find(c =>
                c.type === 'private' &&
                c.conversation_participants.some(p => p.user_id === data.participant_id)
            );
            if (existing) throw new Error('Private conversation already exists with this user');
        }

        if (data.type === 'group') {
            throw new Error('Use channel conversations for group chat');
        }

        if (data.type === 'channel') {
            if (!data.group_channel_id) {
                throw new Error('group_channel_id is required for channel conversations');
            }

            const channel = await messagingRepository.findGroupChannelById(data.group_channel_id);
            if (!channel) {
                throw new Error('Group channel not found');
            }

            const activeMembers = channel.group.group_members.filter(
                (member) => member.status === null || member.status === 'active',
            );
            const isActiveMember = activeMembers.some((member) => member.user_id === user_id);
            if (!isActiveMember) {
                throw new Error('You must be an active group member to use this channel');
            }

            const existing = await messagingRepository.findConversationByChannelId(
                data.group_channel_id,
            );

            if (existing) {
                await messagingRepository.ensureParticipant(existing.id, user_id);
                return existing;
            }

            return await messagingRepository.createConversation(
                user_id,
                data,
                activeMembers.map((member) => member.user_id),
            );
        }

        return await messagingRepository.createConversation(user_id, data);
    },

    async getMyConversations(user_id: number) {
        return await messagingRepository.findConversationsByUserId(user_id);
    },


    async getMessages(user_id: number, conversation_id: number) {
        await this.ensureCanAccessConversation(user_id, conversation_id);

        return await messagingRepository.findMessagesByConversationId(conversation_id);
    },

    async sendMessage(user_id: number, conversation_id: number, data: CreateMessageDtoType) {
        await this.ensureCanAccessConversation(user_id, conversation_id);

        const message = await messagingRepository.createMessage(conversation_id, user_id, data);
        const conversation = await messagingRepository.findConversationById(conversation_id);
        const sender = await userRepository.findById(user_id);
        const actorName = sender ? `${sender.first_name} ${sender.last_name}` : 'Someone';
        const contentPreview = data.content ? `: ${preview(data.content)}` : '';

        await Promise.all(
            (conversation?.conversation_participants ?? [])
                .filter((participant) => participant.user_id !== user_id)
                .map((participant) =>
                    notificationService.notify({
                        user_id: participant.user_id,
                        type: 'MESSAGE',
                        title: `Message from ${actorName}`,
                        message: `${actorName} sent a message${contentPreview}`,
                    }),
                ),
        );

        return message;
    },

    async ensureCanAccessConversation(user_id: number, conversation_id: number) {
        const canAccess = await messagingRepository.canAccessConversation(
            conversation_id,
            user_id,
        );

        if (!canAccess) {
            throw new Error('You are not a participant of this conversation');
        }

        await messagingRepository.ensureParticipant(conversation_id, user_id);
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

        await this.ensureCanAccessConversation(user_id, message.conversation_id);

        return await messagingRepository.markMessageAsRead(message_id, user_id);
    },

};

function preview(value: string, maxLength = 90) {
    return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

export default messagingService;
