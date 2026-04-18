import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { config } from '../config/env';

export const initalizeWebsocket = (server: HttpServer) => {
    // Initialize Socket.IO server with CORS configuration
    const io = new Server(server, {
        cors: {
            origin: config.cors.origin,
            credentials: true,
        },
    });

    // Handle Socket.IO connections
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);
        // Handle socket events here
        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id);
        });
    });

    // Return the initialized Socket.IO server instance for use in other parts of the application
    return io;
}