import express from 'express';
import { getVideoClasses, getVideosByClass } from '../controllers/videoController.js';
import { getAudioClasses, getAudiosByClass } from '../controllers/audioController.js';
import { authLimiter, mediaLimiter } from '../middleware/rateLimiter.js';


const router = express.Router();

router.get('/videos',mediaLimiter, getVideoClasses);
router.get('/audios', mediaLimiter, getAudioClasses);
// router.get('/videos/:classification', mediaLimiter, getVideosByClass);
router.get('/videos', mediaLimiter, getVideosByClass);
router.get('/audios', mediaLimiter, getAudiosByClass);
// router.get('/audios/:classification', mediaLimiter, getAudiosByClass);

export default router;