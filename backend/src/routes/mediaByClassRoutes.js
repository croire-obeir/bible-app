import express from 'express';
import { getVideosByClass } from '../controllers/videoController.js';
import { getAudiosByClass } from '../controllers/audioController.js';
import { authLimiter, mediaLimiter } from '../middleware/rateLimiter.js';


const router = express.Router();

// router.get('/videos',authLimiter, getVideoClasses);
// router.get('/audios', authLimiter, getAudioClasses);
// router.get('/videos/:classification', authLimiter, getVideosByClass);
router.get('/videos', mediaLimiter, getVideosByClass);
router.get('/audios', mediaLimiter, getAudiosByClass);
// router.get('/audios/:classification', mediaLimiter, getAudiosByClass);

export default router;