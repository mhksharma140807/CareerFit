import express from 'express';
import multer from 'multer';
import { extractSkillsFromText, handleFileUpload } from '../controllers/resumeController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

router.post('/extract-skills', optionalAuth, extractSkillsFromText);
router.post('/upload', protect, upload.single('resumeFile'), handleFileUpload);

export default router;

