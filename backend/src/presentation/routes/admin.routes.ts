import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import * as adminController from '../controllers/admin.controller';

const router = Router();

router.use(authenticate);

// We should have a permission called 'admin:access' or something similar
// For now, I'll use 'Manage Roles' as a placeholder if I don't know the exact one, 
// but it's better to check existing permissions.
router.get('/audit-logs', authorize('users.manage'), adminController.getAuditLogs);
router.delete('/users/:userId', authorize('users.manage'), adminController.deleteUser);
router.delete('/posts/:postId', authorize('content.moderate'), adminController.deletePost);

export default router;
