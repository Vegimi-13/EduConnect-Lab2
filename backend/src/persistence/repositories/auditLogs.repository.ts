import { prisma } from '../../database/prismaClients';

interface LogData {
    action: string;
    user_id: number | null;
    entity: string;
    entity_id: number;
    old_value: string | null;
    new_value: string | null;
    ip_address: string | null;
}

const auditLogsRepository = {
    async log(logData: LogData) {
        return await prisma.auditLog.create({
            data: {
                action: logData.action,
                user_id: logData.user_id,
                entity: logData.entity,
                entity_id: logData.entity_id,
                old_value: logData.old_value,
                new_value: logData.new_value,
                ip_address: logData.ip_address,
            }
        });
    },

    async findByUserId(user_id: number) {
        return await prisma.auditLog.findMany({
            where: { user_id },
            orderBy: { created_at: 'desc' },
        });
    },

    async findByEntity(entity: string, entity_id: number) {
        return await prisma.auditLog.findMany({
            where: { entity, entity_id },
            orderBy: { created_at: 'desc' },
        });
    },
};

export default auditLogsRepository;