import { z } from 'zod';

export const LoginDto = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(100),
});

export type LoginDtoType = z.infer<typeof LoginDto>;