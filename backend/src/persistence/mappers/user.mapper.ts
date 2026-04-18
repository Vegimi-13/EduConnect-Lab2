import { User } from '../../database/generated/prisma';

export interface SafeUser {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    is_active: boolean;
    created_at: Date;
}

const userMapper = {
    toSafeUser(user: User): SafeUser {
        return {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            is_active: user.is_active,
            created_at: user.created_at,
        };
    },
};

export default userMapper;