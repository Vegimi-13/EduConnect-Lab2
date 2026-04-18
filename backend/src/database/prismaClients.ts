import { PrismaClient } from '@prisma/client';
import { config } from '../config/env';

export const prisma = new PrismaClient({
    datasources: {
        db: {
            url: config.database.url,
        },
    },
    log: ['query', 'info', 'warn', 'error'], 
});
