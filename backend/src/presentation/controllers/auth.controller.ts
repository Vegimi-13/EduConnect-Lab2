import { get } from "node:http";
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

const authController = {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const ip = getClientIp(req);
            const result = await authService.register(req.body, ip);
            res.status(201).json(result);

        } catch (error) {
            next(error);
        }
    },

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const ip = getClientIp(req);
            const result = await authService.login(req.body, ip);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    },

    async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
            const result = await authService.refresh(req.body.refreshToken);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    },

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const ip = getClientIp(req);
            await authService.logout(req.body.refreshToken, ip);
            res.status(200).json({ message: 'Logged out successfully' });
        } catch (error) {
            next(error);
        }
    }
}

export default authController;