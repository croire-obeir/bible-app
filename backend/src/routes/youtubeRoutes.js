import express from 'express';
import { syncVideosController, syncAudiosController } from '../controllers/youtubeController.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { authorizeYouTube, youtubeCallback } from '../controllers/youtubeAuthController.js';

const router = express.Router();

router.get('/youtube', authorizeYouTube);
router.get('/youtube/callback', youtubeCallback);
router.get('/videos', authLimiter, syncVideosController);
router.get('/audios', authLimiter, syncAudiosController);

export default router;