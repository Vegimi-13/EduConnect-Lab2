// This file handles environment variable configuration and validation for the backend.
// It loads environment variables from a .env file using dotenv, validates required variables,
// and exports a configuration object that can be used throughout the application.
// This ensures type-safe access to environment variables and provides a single source of truth for config.

import dotenv from 'dotenv';
dotenv.config();

export const config = {
    database: {
        url: process.env.DATABASE_URL,
    },
    security: {
        dummy_hash: process.env.DUMMY_HASH,
    },
    server: {
        port: Number(process.env.PORT),
    },
    redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    },
    jwt: {
        access_secret: process.env.ACCESS_TOKEN_SECRET,
        refresh_secret: process.env.REFRESH_TOKEN_SECRET,
        access_expiry: process.env.ACCESS_TOKEN_EXPIRATION,
        refresh_expiry: process.env.REFRESH_TOKEN_EXPIRATION,
    },
    bcrypt: {
        salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS),
    },
    cors: {
        origin: process.env.CORS_ORIGIN,
    },   
}
