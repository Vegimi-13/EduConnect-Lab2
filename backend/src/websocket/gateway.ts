import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { config } from '../config/env';
import { createAdapter } from '@socket.io/redis-adapter';
import { messagingHandler } from './handlers/message.handler';
import { notificationHandler } from './handlers/notification.handler';
import { socketAuthMiddleware } from './socker.middleware';
import redisClient from '../database/redisClient';

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
        console.log('A user connected:', socket.id);
        messagingHandler(io, socket);
        notificationHandler(io, socket);

        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id);
        }); 
    });

    // Return the initialized Socket.IO server instance for use in other parts of the application
    return io;
}
