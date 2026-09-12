import express from 'express';
import { authLimiter } from '../middleware/rateLimiter.js';
import { refreshToken } from '../controllers/refreshTokenController.js';
const router = express.Router();

router.post('/', authLimiter, refreshToken);
export default router;