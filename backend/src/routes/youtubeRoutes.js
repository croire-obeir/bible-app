import express from 'express';
import { getVideosController, getAudiosController } from '../controllers/youtubeController.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/videos', authLimiter, getVideosController);
router.get('/audios', authLimiter, getAudiosController);

export default router;