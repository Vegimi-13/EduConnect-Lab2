import { Request, Response, NextFunction } from 'express';
import jwtService from '../../business/services/jwt.service';

export interface AuthRequest extends Request {
    user?: {
        userId: number;
        email: string;
    };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.cookies?.accessToken;

    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    try {
        const payload = jwtService.verifyAccessToken(token);
        req.user = payload;
        next();
    } catch {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};