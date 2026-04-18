import bcrypt from 'bcryptjs';
import { config } from '../../config/env';
import { RegisterDtoType } from '../dto/register.dto';
import { LoginDtoType } from '../dto/login.dto';
import jwtService from './jwt.service';
import userRepository from '../../persistence/repositories/user.repository';
import userMapper, { SafeUser } from '../../persistence/mappers/user.mapper';

export interface AuthResponse {
    user: SafeUser;
    accessToken: string;
    refreshToken: string;
}

const authService = {
    async register(data: RegisterDtoType): Promise<AuthResponse> {
        const existing = await userRepository.findByEmail(data.email);
        if (existing) {
            throw new Error('Email already in use');
        }

        const password_hash = await bcrypt.hash(
            data.password,
            config.bcrypt.salt_rounds
        );

        const user = await userRepository.create({ ...data, password_hash });
        const payload = { userId: user.id, email: user.email };

        return {
            user: userMapper.toSafeUser(user),
            accessToken: jwtService.generateAccessToken(payload),
            refreshToken: jwtService.generateRefreshToken(payload),
        };
    },

    async login(data: LoginDtoType): Promise<AuthResponse> {
        const user = await userRepository.findByEmail(data.email);

        const dummyHash = '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345';
        const passwordToCheck = user ? user.password_hash : dummyHash;
        const isMatch = await bcrypt.compare(data.password, passwordToCheck);

        if (!user || !isMatch) {
            throw new Error('Invalid credentials');
        }

        if (!user.is_active) {
            throw new Error('Account is disabled');
        }

        const payload = { userId: user.id, email: user.email };

        return {
            user: userMapper.toSafeUser(user),
            accessToken: jwtService.generateAccessToken(payload),
            refreshToken: jwtService.generateRefreshToken(payload),
        };
    },
};

export default authService;