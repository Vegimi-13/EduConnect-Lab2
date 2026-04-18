import { Request, Response } from 'express';
import authService from '../../business/services/auth.service';
import jwtService from '../../business/services/jwt.service';

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
};

const authController = {
    async register(req: Request, res: Response): Promise<void> {
        try {
            const result = await authService.register(req.body);

            const refreshToken = jwtService.generateRefreshToken({
                userId: result.user.id,
                email: result.user.email,
            });

            res.cookie('accessToken', result.accessToken, {
                ...cookieOptions,
                maxAge: 15 * 60 * 1000, // 15 minutes
            });

            res.cookie('refreshToken', refreshToken, {
                ...cookieOptions,
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            res.status(201).json({ user: result.user });
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
                return;
            }
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    async login(req: Request, res: Response): Promise<void> {
        try {
            const result = await authService.login(req.body);

            const refreshToken = jwtService.generateRefreshToken({
                userId: result.user.id,
                email: result.user.email,
            });

            res.cookie('accessToken', result.accessToken, {
                ...cookieOptions,
                maxAge: 15 * 60 * 1000, // 15 minutes
            });

            res.cookie('refreshToken', refreshToken, {
                ...cookieOptions,
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            res.status(200).json({ user: result.user });
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
                return;
            }
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    async logout(_req: Request, res: Response): Promise<void> {
        res.clearCookie('accessToken', cookieOptions);
        res.clearCookie('refreshToken', cookieOptions);
        res.status(200).json({ message: 'Logged out successfully' });
    },

    async refresh(req: Request, res: Response): Promise<void> {
        try {
            const token = req.cookies?.refreshToken;

            if (!token) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const payload = jwtService.verifyRefreshToken(token);

            const newAccessToken = jwtService.generateAccessToken({
                userId: payload.userId,
                email: payload.email,
            });

            res.cookie('accessToken', newAccessToken, {
                ...cookieOptions,
                maxAge: 15 * 60 * 1000,
            });

            res.status(200).json({ message: 'Token refreshed' });
        } catch {
            res.status(401).json({ message: 'Invalid or expired refresh token' });
        }
    },
};

export default authController;