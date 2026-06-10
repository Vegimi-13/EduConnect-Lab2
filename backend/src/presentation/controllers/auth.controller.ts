import authService from "../../business/services/auth.service";
import { Request, Response, NextFunction } from "express";

export function getClientIp(req: any): string {
  const forwarded = req.headers["x-forwarded-for"];

  if (Array.isArray(forwarded)) {
    return forwarded[0];
  }

  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }

  return req.socket?.remoteAddress || "unknown";
}

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/', 
}

const authController = {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const ip = getClientIp(req);
            const result = await authService.register(req.body, ip);
            const cleanedResult = {
                user: result.user,
                accessToken: result.accessToken,
            }

            res.cookie('refreshToken', result.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }); 
            res.cookie('accessToken', result.accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }); 
            res.status(201).json(cleanedResult);
        } catch (error) {
            next(error);
        }
    },

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const ip = getClientIp(req);
            const result = await authService.login(req.body, ip);
            const cleanedResult = {
                user: result.user,
                accessToken: result.accessToken,
            }

            res.cookie('refreshToken', result.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }); 
            res.cookie('accessToken', result.accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }); 
            res.status(200).json(cleanedResult);
        } catch (error) {
            next(error);
        }
    },

    async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
            const result = await authService.refresh(req.cookies.refreshToken);
            const cleanedResult = {
                user: result.user,
                accessToken: result.accessToken,
            };
            res.cookie('refreshToken', result.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }); 
            res.cookie('accessToken', result.accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
        
            res.status(200).json(cleanedResult);
        } catch (error) {
            next(error);
        }
    },

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const ip = getClientIp(req);
            await authService.logout(req.cookies.refreshToken, ip);
            res.clearCookie('refreshToken', cookieOptions);
            res.clearCookie('accessToken', cookieOptions);
            res.status(200).json({ message: 'Logged out successfully' });
        } catch (error) {
            next(error);
        }
    }
}

export default authController;
