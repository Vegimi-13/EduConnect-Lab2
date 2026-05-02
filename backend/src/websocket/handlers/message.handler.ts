// src/websocket/handlers/messaging.handler.ts
import { Server, Socket } from 'socket.io';
import messagingService from '../../business/services/message.service';
import { MessageType } from '../../shared/constants/enum';

export const messagingHandler = (io: Server, socket: Socket) => {
    console.log('messagingHandler called for user:', socket.data.user_id);
    const user_id = socket.data.user_id;

    socket.on('join_conversation', async (data: { conversation_id: number }) => {
        try {
            const parsed = Number(data.conversation_id);
            await messagingService.getMessages(user_id, parsed);
            socket.join(`conversation:${parsed}`);
            console.log(`User ${user_id} joined conversation ${parsed}`);
            socket.emit('joined', { conversation_id: parsed });
        } catch (error: any) {
            console.log('join_conversation error:', error.message);
            socket.emit('exception', error.message);
        }
    });

    socket.on('leave_conversation', (data: { conversation_id: number }) => {
        const parsed = Number(data.conversation_id);
        socket.leave(`conversation:${parsed}`);
        console.log(`User ${user_id} left conversation ${parsed}`);
    });

    socket.on('send_message', async (data: { conversation_id: number; content: string; message_type?: MessageType; reply_to_message_id?: number }) => {
        try {
            const message = await messagingService.sendMessage(user_id, Number(data.conversation_id), {
                content: data.content,
                message_type: data.message_type || 'text',
                reply_to_message_id: data.reply_to_message_id,
            });
            io.to(`conversation:${data.conversation_id}`).emit('new_message', message);
        } catch (error: any) {
            console.log('send_message error:', error.message);
            socket.emit('exception', error.message);
        }
    });

    socket.on('update_message', async (data: { message_id: number; conversation_id: number; content: string }) => {
        try {
            const updated = await messagingService.updateMessage(user_id, Number(data.message_id), { content: data.content });
            io.to(`conversation:${updated.conversation_id}`).emit('message_updated', updated);
        } catch (error: any) {
            console.log('update_message error:', error.message);
            socket.emit('exception', error.message);
        }
    });

    socket.on('delete_message', async (data: { message_id: number; conversation_id: number }) => {
        try {
            const deleted = await messagingService.deleteMessage(user_id, Number(data.message_id));
            io.to(`conversation:${deleted.conversation_id}`).emit('message_deleted', { message_id: Number(data.message_id) });
        } catch (error: any) {
            console.log('delete_message error:', error.message);
            socket.emit('exception', error.message);
        }
    });

    socket.on('typing', async (data: { conversation_id: number }) => {
        try {
            const parsed = Number(data.conversation_id);
            await messagingService.ensureCanAccessConversation(user_id, parsed);
            socket.to(`conversation:${parsed}`).emit('user_typing', { user_id, conversation_id: parsed });
        } catch (error: any) {
            console.log('typing error:', error.message);
            socket.emit('exception', error.message);
        }
    });

    socket.on('stop_typing', async (data: { conversation_id: number }) => {
        try {
            const parsed = Number(data.conversation_id);
            await messagingService.ensureCanAccessConversation(user_id, parsed);
            socket.to(`conversation:${parsed}`).emit('user_stop_typing', { user_id, conversation_id: parsed });
        } catch (error: any) {
            console.log('stop_typing error:', error.message);
            socket.emit('exception', error.message);
        }
    });

    socket.on('read_message', async (data: { message_id: number; conversation_id: number }) => {
        try {
            const status = await messagingService.markAsRead(user_id, data.message_id);
            socket.to(`conversation:${status.message.conversation_id}`).emit('message_read', {
                message_id: data.message_id,
                user_id,
            });
        } catch (error: any) {
            console.log('read_message error:', error.message);
            socket.emit('exception', error.message);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User ${user_id} disconnected`);
    });
};
