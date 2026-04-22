import userRepository from "../../persistence/repositories/user.repository";
import userRoleRepository from "../../persistence/repositories/userRoles.repository";
import roleRepository from "../../persistence/repositories/role.repository";
import refreshTokenRepository from "../../persistence/repositories/refreshToken.repository";
import auditLogsRepository from "../../persistence/repositories/auditLogs.repository";

import { RegisterDtoType } from "../dto/register.dto";
import { LoginDtoType } from "../dto/login.dto";
import { config } from "../../config/env";
import bcrypt from 'bcryptjs';
import jwtService from "./jwt.service";

const authService = {
    async register(data: RegisterDtoType, ip: string) {
        const userExists = await userRepository.findByEmail(data.email);
        if (userExists) throw new Error('User with this email already exists');

        const password_hash = await bcrypt.hash(data.password, config.bcrypt.salt_rounds);

        const userCreated = await userRepository.create(
            data.first_name,
            data.last_name,
            data.email,
            password_hash
        );

        const defaultRole = await roleRepository.findByName('user');

        if (!defaultRole) {
            throw new Error('Default role not found');
        }

        await userRoleRepository.assignRole(userCreated.id, defaultRole.id);

        const accessToken = jwtService.generateAccessToken({
            userId: userCreated.id,
            email: userCreated.email
        });

        const refreshToken = jwtService.generateRefreshToken({
            userId: userCreated.id,
            email: userCreated.email
        });

        const token_hash = await bcrypt.hash(refreshToken, config.bcrypt.salt_rounds);

        await refreshTokenRepository.create({
            user_id: userCreated.id,
            token_hash,
        });

        await auditLogsRepository.log({
            action: 'User Registration',
            user_id: userCreated.id,
            entity: 'User',
            entity_id: userCreated.id,
            old_value: null,
            new_value: JSON.stringify({ email: userCreated.email }),
            ip_address: ip,
        });

        return {
            user: {
                id: userCreated.id,
                email: userCreated.email,
            },
            accessToken,
            refreshToken
        };
    },

    async login(data: LoginDtoType, ip: string) {
        const userExists = await userRepository.findByEmail(data.email);
        if (!userExists) throw new Error('Invalid email');

        const passwordMatch = await bcrypt.compare(data.password, userExists.password_hash);
        if (!passwordMatch) throw new Error('Invalid password');

        const accessToken = jwtService.generateAccessToken({
            userId: userExists.id,
            email: userExists.email
        });

        const refreshToken = jwtService.generateRefreshToken({
            userId: userExists.id,
            email: userExists.email
        });

        const token_hash = await bcrypt.hash(refreshToken, config.bcrypt.salt_rounds);

        await refreshTokenRepository.create({
            user_id: userExists.id,
            token_hash,
        });

        await auditLogsRepository.log({
            action: 'User Login',
            user_id: userExists.id,
            entity: 'User',
            entity_id: userExists.id,
            old_value: null,
            new_value: JSON.stringify({ email: userExists.email }),
            ip_address: ip,
        });

        return {
            user: {
                id: userExists.id,
                email: userExists.email,
            },
            accessToken,
            refreshToken
        };
    },

    async logout(refreshToken: string, ip: string) {
        const decoded = jwtService.verifyRefreshToken(refreshToken);

        const tokens = await refreshTokenRepository.findByUserId(decoded.userId);
        const tokenRecord = await Promise.all(
        tokens.map(async (record) => {
            const match = await bcrypt.compare(refreshToken, record.token_hash);
            return match ? record : null;
        })).then(results => results.find(r => r !== null));

        if (!tokenRecord) throw new Error('Invalid refresh token');

        await refreshTokenRepository.revokeToken(tokenRecord.id);

        await auditLogsRepository.log({
            action: 'User Logout',
            user_id: tokenRecord.user_id,
            entity: 'User',
            entity_id: tokenRecord.user_id,
            old_value: null,
            new_value: null,
            ip_address: ip,
        });
    },

    async refresh(refreshToken: string) {
        const decoded = jwtService.verifyRefreshToken(refreshToken);
        const tokens = await refreshTokenRepository.findByUserId(decoded.userId);

        const tokenRecord = await Promise.all(
        tokens.map(async (record) => {
            const match = await bcrypt.compare(refreshToken, record.token_hash);
            return match ? record : null;
        })).then(results => results.find(r => r !== null));

        if (!tokenRecord) throw new Error('Invalid refresh token');

        const user = await userRepository.findById(tokenRecord.user_id);
        if (!user) throw new Error('User not found');

        const newAccessToken = jwtService.generateAccessToken({
            userId: user.id,
            email: user.email
        });

        const newRefreshToken = jwtService.generateRefreshToken({
            userId: user.id,
            email: user.email
        });

        const new_token_hash = await bcrypt.hash(newRefreshToken, config.bcrypt.salt_rounds);

        await refreshTokenRepository.revokeToken(tokenRecord.id);

        await refreshTokenRepository.create({
            user_id: user.id,
            token_hash: new_token_hash,
        });

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }
};

export default authService;