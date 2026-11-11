
import express from 'express';
import { registerInstallation } from '../controllers/appInstallationsController.js';

const router = express.Router();

router.post('/register', registerInstallation);

export default router;
