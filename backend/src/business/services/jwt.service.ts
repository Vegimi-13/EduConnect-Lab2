import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../../config/env';

export interface TokenPayload {
    userId: number; // ✅ FIX
    email: string;
}

const accessOptions: SignOptions = {
    expiresIn: config.jwt.access_expiry as SignOptions['expiresIn'],
};

const refreshOptions: SignOptions = {
    expiresIn: config.jwt.refresh_expiry as SignOptions['expiresIn'],
};

const jwtService = {
    generateAccessToken(payload: TokenPayload): string {
        return jwt.sign(payload, config.jwt.access_secret as string, accessOptions);
    },

    generateRefreshToken(payload: TokenPayload): string {
        return jwt.sign(payload, config.jwt.refresh_secret as string, refreshOptions);
    },

    verifyAccessToken(token: string): TokenPayload {
        return jwt.verify(token, config.jwt.access_secret as string) as TokenPayload;
    },

    verifyRefreshToken(token: string): TokenPayload {
        return jwt.verify(token, config.jwt.refresh_secret as string) as TokenPayload;
    },
};

export default jwtService;