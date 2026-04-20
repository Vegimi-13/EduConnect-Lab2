import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { RegisterDto } from '../../business/dto/register.dto';
import { LoginDto } from '../../business/dto/login.dto';

const router = Router();

router.post('/register', validate(RegisterDto), authController.register);
router.post('/login', validate(LoginDto), authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', authController.refreshToken);

export default router;