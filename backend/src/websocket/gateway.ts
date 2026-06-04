import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { config } from '../config/env';
import { createAdapter } from '@socket.io/redis-adapter';
import { messagingHandler } from './handlers/message.handler';
import { notificationHandler } from './handlers/notification.handler';
import { socketAuthMiddleware } from './socker.middleware';
import redisClient from '../database/redisClient';

const onlineUsers = new Map<number, Set<string>>();

export const initalizeWebsocket = (server: HttpServer) => {
    // Initialize Socket.IO server with CORS configuration
    const io = new Server(server, {
        cors: {
            origin: config.cors.origin,
            credentials: true,
        },
    });

    // Set up Redis adapter for horizontal scaling
    const pubClient = redisClient
    const subClient = pubClient.duplicate();

    io.adapter(createAdapter(pubClient, subClient));

    io.use(socketAuthMiddleware);

    // Handle Socket.IO connections
    io.on('connection', (socket) => {
        const userId = Number(socket.data.user_id);

        console.log('A user connected:', socket.id);
        markUserOnline(io, userId, socket.id);
        socket.emit('presence_snapshot', { user_ids: getOnlineUserIds() });

        socket.on('presence:get', () => {
            socket.emit('presence_snapshot', { user_ids: getOnlineUserIds() });
        });

        messagingHandler(io, socket);
        notificationHandler(io, socket);

        socket.on('disconnect', () => {
            markUserOffline(io, userId, socket.id);
            console.log('A user disconnected:', socket.id);
        }); 
    });

    // Return the initialized Socket.IO server instance for use in other parts of the application
    return io;
}

function markUserOnline(io: Server, userId: number, socketId: string) {
    if (!Number.isInteger(userId)) {
        return;
    }

    const sockets = onlineUsers.get(userId) ?? new Set<string>();
    const wasOffline = sockets.size === 0;

    sockets.add(socketId);
    onlineUsers.set(userId, sockets);

    if (wasOffline) {
        io.emit('presence_user_online', { user_id: userId });
    }
}

function markUserOffline(io: Server, userId: number, socketId: string) {
    const sockets = onlineUsers.get(userId);

    if (!sockets) {
        return;
    }

    sockets.delete(socketId);

    if (sockets.size) {
        return;
    }

    onlineUsers.delete(userId);
    io.emit('presence_user_offline', { user_id: userId });
}

function getOnlineUserIds() {
    return Array.from(onlineUsers.keys());
}
