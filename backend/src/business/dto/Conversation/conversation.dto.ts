import { z } from 'zod';

export const CreateConversationDto = z.object({
    type: z.enum(['private', 'group', 'channel']),
    name: z.string().optional(),       
    participant_id: z.number(),
    group_channel_id: z.number().optional(), 
});

export type CreateConversationDtoType = z.infer<typeof CreateConversationDto>;