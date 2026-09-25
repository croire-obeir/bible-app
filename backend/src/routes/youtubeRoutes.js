import express from 'express';
import { getVideosController, getAudiosController } from '../controllers/youtubeController.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { authorizeYouTube, youtubeCallback } from '../controllers/youtubeAuthController.js';

const router = express.Router();

router.get('/youtube', authorizeYouTube);
router.get('/youtube/callback', youtubeCallback);
router.get('/videos', authLimiter, getVideosController);
router.get('/audios', authLimiter, getAudiosController);

export default router;