// src/presentation/routes/messaging.routes.ts
import { Router } from 'express';
import messagingController from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, messagingController.createConversation);
router.get('/', authenticate, messagingController.getMyConversations);
router.get('/:id/messages', authenticate, messagingController.getMessages);

export default router;