import express from 'express';
import { getVideoClasses, getVideosByClass } from '../controllers/videoController.js';
import { getAudioClasses, getAudiosByClass } from '../controllers/audioController.js';
import { authLimiter } from '../middleware/rateLimiter.js';


const router = express.Router();

router.get('/videos',authLimiter, getVideoClasses);
router.get('/audios', authLimiter, getAudioClasses);
// router.get('/videos/:classification', authLimiter, getVideosByClass);
router.get('/videos', authLimiter, getVideosByClass);
router.get('/audios', authLimiter, getAudiosByClass);
// router.get('/audios/:classification', authLimiter, getAudiosByClass);

export default router;