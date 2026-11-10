import express from 'express';
import {getNewVideos} from '../controllers/newVideosController.js';
import {getNewAudios} from '../controllers/newAudiosController.js';
import { mediaLimiter } from '../middleware/rateLimiter.js';


const router = express.Router();


router.get('/videos', mediaLimiter, getNewVideos);
router.get('/audios', mediaLimiter, getNewAudios);


export default router;