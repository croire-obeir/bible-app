import express from 'express';
import {getNewVidoes} from '../controllers/videoController.js';
import {getNewAudios} from '../controllers/audioController.js';
import { mediaLimiter } from '../middleware/rateLimiter.js';


const router = express.Router();


router.get('/videos', mediaLimiter, getNewVidoes);
router.get('/audios', mediaLimiter, getNewAudios);


export default router;