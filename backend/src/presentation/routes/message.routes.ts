import { Router } from 'express';
import messagingController from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/mutual-follows', authenticate, messagingController.getMutualFollows);
router.post('/', authenticate, messagingController.createConversation);
router.get('/', authenticate, messagingController.getMyConversations);
router.get('/:id/messages', authenticate, messagingController.getMessages);
router.post('/:id/messages', authenticate, messagingController.sendMessage);

export default router;