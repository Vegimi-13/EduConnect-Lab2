import { z } from 'zod';

export const CreateMessageDto = z.object({
    content: z.string().min(1).max(2000),
    message_type: z.enum(['text', 'image', 'file']).default('text'),
    reply_to_message_id: z.number().optional(),
});

export const UpdateMessageDto = z.object({
    content: z.string().min(1).max(2000),
});

export type CreateMessageDtoType = z.infer<typeof CreateMessageDto>;
export type UpdateMessageDtoType = z.infer<typeof UpdateMessageDto>;