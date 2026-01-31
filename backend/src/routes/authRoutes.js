import express from 'express';
import { signup, login, googleLogin } from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/signup', authLimiter, signup);
router.post('/login', login);
router.post('/google-login', googleLogin);

export default router;