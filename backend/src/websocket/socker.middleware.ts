import { Socket } from 'socket.io';
import jwtService from '../business/services/jwt.service';

export const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
    const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.token as string ||
        getCookieValue(socket.handshake.headers.cookie, 'accessToken');

    if (!token) return next(new Error('Authentication error: No token provided'));

    try {
        const decoded = jwtService.verifyAccessToken(token);
        socket.data.user_id = decoded.userId;
        next();
    } catch (error) {
        next(new Error('Authentication error: Invalid token'));
    }
};

function getCookieValue(cookieHeader: string | undefined, name: string) {
    if (!cookieHeader) return undefined;

    return cookieHeader
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${name}=`))
        ?.slice(name.length + 1);
}
