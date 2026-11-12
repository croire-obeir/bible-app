import express from "express";
import { getDailyVerse } from "../controllers/dailyVerseController.js";

const router = express.Router();

router.get("/", getDailyVerse);

export default router;