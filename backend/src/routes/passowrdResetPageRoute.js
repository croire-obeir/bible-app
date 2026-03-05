import express from 'express';
const router = express.Router();

import {serveResetPasswordPage} from '../controllers/servePasswordResetController.js';

router.get('/', serveResetPasswordPage);

export default router;