import { z } from 'zod';

export const CreateConversationDto = z.object({
    type: z.enum(['private', 'group', 'channel']),
    name: z.string().optional(),       
    participant_id: z.number().int().positive().optional(),
    group_channel_id: z.number().int().positive().optional(), 
}).superRefine((data, ctx) => {
    if (data.type === 'private' && !data.participant_id) {
        ctx.addIssue({
            code: 'custom',
            message: 'participant_id is required for private conversations',
            path: ['participant_id'],
        });
    }

    if (data.type === 'channel' && !data.group_channel_id) {
        ctx.addIssue({
            code: 'custom',
            message: 'group_channel_id is required for channel conversations',
            path: ['group_channel_id'],
        });
    }
});

export type CreateConversationDtoType = z.infer<typeof CreateConversationDto>;
