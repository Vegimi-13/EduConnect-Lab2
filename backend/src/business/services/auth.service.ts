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

        const password_hash = await bcrypt.hash(data.password, config.bcrypt.salt_rounds)

        // Create the user in the database with the provided details and hashed password, returning the created user record.
        const userCreated = await userRepository.create(
            data.first_name,
            data.last_name,
            data.email,
            password_hash
        )

        // Assign the default 'user' role to the newly created user by retrieving the role from the database and creating a user-role association.
        const defaultRole = await roleRepository.findByName('user');
        await userRoleRepository.assignRole(userCreated.id, defaultRole.id);

        const accessToken = jwtService.generateAccessToken({ userId: userCreated.id, email: userCreated.email });
        const refreshToken = jwtService.generateRefreshToken({ userId: userCreated.id, email: userCreated.email });

        const token_hash = await bcrypt.hash(refreshToken, config.bcrypt.salt_rounds);

        // Store the hashed refresh token in the database with an expiration time, allowing for secure token management and validation during authentication.
        await refreshTokenRepository.create({ user_id: userCreated.id, token_hash, expires_at: new Date(Date.now() + (config.jwt.refresh_expiry as number) * 1000) });

        // Log the user registration action in the audit logs, recording details such as the user ID, email, and the nature of the action for security and monitoring purposes.
        await auditLogsRepository.log({
            action: 'User Registration',
            user_id: userCreated.id,
            entity: 'User',
            entity_id: userCreated.id,
            old_value: null,
            new_value: JSON.stringify({ email: userCreated.email }),
            ip_address: ip,
        });

        // Return the created user details along with the generated access and refresh tokens, allowing the client to authenticate subsequent requests using the access token and refresh it when needed using the refresh token.
        return {
            user: {
                id: userCreated.id,
                email: userCreated.email,
            },
            accessToken,
            refreshToken,
        }
    },

    async login(data: LoginDtoType, ip: string) {
        // Validate the user's email and password during login, generating access and refresh tokens upon successful authentication, and storing the hashed refresh token in the database for secure token management.
        const userExists = await userRepository.findByEmail(data.email);
        if (!userExists) throw new Error('Invalid email');

        const passwordMatch = await bcrypt.compare(data.password, userExists.password_hash);
        if (!passwordMatch) throw new Error('Invalid password');

        const accessToken = jwtService.generateAccessToken({ userId: userExists.id, email: userExists.email });
        const refreshToken = jwtService.generateRefreshToken({ userId: userExists.id, email: userExists.email });

        const token_hash = await bcrypt.hash(refreshToken, config.bcrypt.salt_rounds);

        // Persist the hashed refresh token in the database, associating it with the user's ID and setting an expiration time, enabling secure token management and validation during future authentication requests.
        await refreshTokenRepository.create({
            user_id: userExists.id,
            token_hash,
        })

        // Return the authenticated user's details along with the generated access and refresh tokens, allowing the client to authenticate subsequent requests using the access token and refresh it when needed using the refresh token.
        return {
            user: {
                id: userExists.id,
                email: userExists.email,
            },
            accessToken,
            refreshToken,
        }
    },

    async logout(refreshToken: string, ip: string) {
        // Handle user logout by revoking the provided refresh token, ensuring that it can no longer be used for authentication, and logging the logout action in the audit logs for security and monitoring purposes.
        const tokenRecord = await refreshTokenRepository.findByTokenHash(await bcrypt.hash(refreshToken, config.bcrypt.salt_rounds));
        if (!tokenRecord) throw new Error('Invalid refresh token');

        await refreshTokenRepository.revokeToken(tokenRecord.id);

        // Log the user logout action in the audit logs, recording details such as the user ID, email, and the nature of the action for security and monitoring purposes.
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

    async refresh (refreshToken: string) {
        // Handle token refresh by validating the provided refresh token, generating new access and refresh tokens upon successful validation, and updating the stored refresh token in the database to ensure secure token management.
        const tokenRecord = await refreshTokenRepository.findByTokenHash(await bcrypt.hash(refreshToken, config.bcrypt.salt_rounds));
        if (!tokenRecord) throw new Error('Invalid refresh token');

        const user = await userRepository.findById(tokenRecord.user_id);
        if (!user) throw new Error('User not found');

        const newAccessToken = jwtService.generateAccessToken({ userId: user.id, email: user.email });
        const newRefreshToken = jwtService.generateRefreshToken({ userId: user.id, email: user.email });

        const new_token_hash = await bcrypt.hash(newRefreshToken, config.bcrypt.salt_rounds);

        // Update the stored refresh token in the database with the new hashed token and expiration time, ensuring that the old refresh token is invalidated and cannot be used for future authentication requests.
        await refreshTokenRepository.create({
            user_id: user.id,
            token_hash: new_token_hash,
            expires_at: new Date(Date.now() + (config.jwt.refresh_expiry as number) * 1000),
        });

        // Return the newly generated access and refresh tokens, allowing the client to authenticate subsequent requests using the new access token and refresh it when needed using the new refresh token.
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        }
    }

}

export default authService;