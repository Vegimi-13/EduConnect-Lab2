import { prisma } from '../../database/prismaClients';

interface LogData {
    action: string;
    user_id: string;
    entity: string;
    entity_id: string;
    old_value: string | null;
    new_value: string | null;
    ip_address: string;
}

const auditLogsRepository = {

    // Logs an action performed by a user on an entity, capturing the old and new values for auditing purposes.
    async log(logData: LogData) {
        return await prisma.auditLogs.create({
            data: {
                action: logData.action,
                user_id: logData.user_id,
                entity: logData.entity,
                entity_id: logData.entity_id,
                old_value: logData.old_value,
                new_value: logData.new_value,
                ip_address: logData.ip_address,
            }
        })
    },

    // Retrieves all audit logs associated with a specific user, ordered by timestamp in descending order.
    async findByUserId(user_id: string) {
        return await prisma.auditLogs.findMany({
            where: { user_id },
            orderBy: { timestamp: 'desc' },
        });
    },

    // Retrieves all audit logs for a specific entity and entity ID, ordered by timestamp in descending order.
    async findByEntity(entity: string, entity_id: string) {
        return await prisma.auditLogs.findMany({
            where: { entity, entity_id },
            orderBy: { timestamp: 'desc' },
        });
    }, 

}

export default auditLogsRepository;