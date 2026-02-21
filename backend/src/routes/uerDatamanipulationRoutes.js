import express from 'express';
import { updateUserData, deleteUserData } from '../controllers/userDataManipulationController.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import tokkenVerify from '../middleware/auth.js';

const router = express.Router();

// Rate Limiter goes FIRST, then Token Verification, then the Controller
router.put('/update/:userId', authLimiter, tokkenVerify, updateUserData);
router.delete('/delete/:userId', authLimiter, tokkenVerify, deleteUserData);

export default router;