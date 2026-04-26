import { Redis } from 'ioredis';
import { config } from '../config/env';

const redisClient = new Redis({
    host: config.redis.host,
    port: config.redis.port,
});

redisClient.on('connect', () => console.log('Redis connected'));
redisClient.on('error', (err) => console.error('Redis error:', err));

export default redisClient;