import { z } from 'zod';

export const RegisterDto = z.object({
    first_name: z.string().min(2).max(50),
    last_name: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(8).max(100),
});

export type RegisterDtoType = z.infer<typeof RegisterDto>;