// src/persistence/repositories/messaging.repository.ts
import { prisma } from '../../database/prismaClients';
import { CreateConversationDtoType } from '../../business/dto/Conversation/conversation.dto';
import { CreateMessageDtoType, UpdateMessageDtoType } from '../../business/dto/Conversation/message.dto';

const messagingRepository = {

    async createConversation(user_id: number, data: CreateConversationDtoType) {
        return await prisma.conversation.create({
            data: {
                type: data.type,
                name: data.name,
                created_by: user_id,
                group_channel_id: data.group_channel_id,
                conversation_participants: {
                    create: [
                        { user_id },
                        ...(data.participant_id ? [{ user_id: data.participant_id }] : []),
                    ],
                },
            },
            include: {
                conversation_participants: true,
            },
        });
    },

    async findConversationById(id: number) {
        return await prisma.conversation.findUnique({
            where: { id },
            include: {
                conversation_participants: {
                    include: { user: { select: { id: true, first_name: true, last_name: true } } },
                },
            },
        });
    },

    async findConversationsByUserId(user_id: number) {
        return await prisma.conversation.findMany({
            where: {
                conversation_participants: {
                    some: { user_id },
                },
            },
            include: {
                conversation_participants: {
                    include: { user: { select: { id: true, first_name: true, last_name: true } } },
                },
                messages: {
                    orderBy: { created_at: 'desc' },
                    take: 1, // last message preview
                },
            },
            orderBy: { created_at: 'desc' },
        });
    },

    async isParticipant(conversation_id: number, user_id: number) {
        const participant = await prisma.conversationParticipant.findUnique({
            where: { conversation_id_user_id: { conversation_id, user_id } },
        });
        return !!participant;
    },


    async findMessagesByConversationId(conversation_id: number) {
        return await prisma.message.findMany({
            where: {
                conversation_id,
                is_deleted: false,
            },
            include: {
                sender: { select: { id: true, first_name: true, last_name: true } },
                reply_to_message: true,
            },
            orderBy: { created_at: 'asc' },
        });
    },

    async createMessage(conversation_id: number, sender_id: number, data: CreateMessageDtoType) {
        return await prisma.message.create({
            data: {
                conversation_id,
                sender_id,
                content: data.content,
                message_type: data.message_type,
                reply_to_message_id: data.reply_to_message_id,
            },
            include: {
                sender: { select: { id: true, first_name: true, last_name: true } },
                reply_to_message: true,
            },
        });
    },

    async findMessageById(id: number) {
        return await prisma.message.findUnique({
            where: { id },
        });
    },

    async updateMessage(id: number, data: UpdateMessageDtoType) {
        return await prisma.message.update({
            where: { id },
            data: {
                content: data.content,
                is_edited: true,
                edited_at: new Date(),
            },
            include: {
                sender: { select: { id: true, first_name: true, last_name: true } },
                reply_to_message: true,
            },
        });
    },

    async deleteMessage(id: number) {
        return await prisma.message.update({
            where: { id },
            data: {
                is_deleted: true,
                deleted_at: new Date(),
            },
            include: {
                sender: { select: { id: true, first_name: true, last_name: true } },
                reply_to_message: true,
            },
        });
    },

    async markMessageAsRead(message_id: number, user_id: number) {
        return await prisma.messageStatus.upsert({
            where: { message_id_user_id: { message_id, user_id } },
            update: { read_at: new Date() },
            create: { message_id, user_id, delivered_at: new Date(), read_at: new Date() },
        });
    },

};

export default messagingRepository;