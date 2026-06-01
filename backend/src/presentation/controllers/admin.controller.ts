import { Request, Response, NextFunction } from 'express';
import auditLogsRepository from '../../persistence/repositories/auditLogs.repository';
import userRepository from '../../persistence/repositories/user.repository';
import postRepository from '../../persistence/repositories/FeedRepositories/posts.repository';

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Number(req.query.page as string) || 1;
        const limit = Number(req.query.limit as string) || 10;
        
        const result = await auditLogsRepository.findMany(page, limit);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = Number(req.params.userId);
        
        await userRepository.delete(userId);
        
        await auditLogsRepository.log({
            action: 'DELETE_USER',
            user_id: req.user.userId,
            entity: 'USER',
            entity_id: userId,
            old_value: JSON.stringify({ is_active: true }),
            new_value: JSON.stringify({ is_active: false }),
            ip_address: req.ip || null,
        });

        res.status(200).json({ message: 'User deactivated successfully' });
    } catch (error) {
        next(error);
    }
};

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const postId = Number(req.params.postId);
        const post = await postRepository.findById(postId);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        await postRepository.softDelete(postId);
        
        await auditLogsRepository.log({
            action: 'ADMIN_DELETE_POST',
            user_id: req.user.userId,
            entity: 'POST',
            entity_id: postId,
            old_value: JSON.stringify(post),
            new_value: JSON.stringify({ is_deleted: true }),
            ip_address: req.ip || null,
        });

        res.status(200).json({ message: 'Post deleted successfully by admin' });
    } catch (error) {
        next(error);
    }
};
