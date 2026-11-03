import express from 'express';
import multer from 'multer';
import { extractSkillsFromText, handleFileUpload } from '../controllers/resumeController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

// Resilient upload middleware accepting 'resume', 'resumeFile', 'file', or any single file upload
const uploadResumeMiddleware = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Resume file size exceeds the 5 MB limit.',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed.',
      });
    }

    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }

    next();
  });
};

// Informative GET endpoints to prevent 404s when inspecting in browsers or API clients
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CareerFit Resume Analysis API is active.',
    endpoints: {
      upload: 'POST /api/resume/upload (multipart/form-data with "resume" or "resumeFile")',
      extractSkills: 'POST /api/resume/extract-skills (JSON body with { text })',
    },
    supportedFormats: ['.pdf', '.txt'],
    maxFileSize: '5 MB',
  });
});

router.get('/upload', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CareerFit Resume Upload API. Send a POST request with multipart/form-data (field name "resume" or "resumeFile") and a Bearer JWT authorization token.',
    method: 'POST',
    supportedFormats: ['.pdf', '.txt'],
    maxFileSize: '5 MB',
  });
});

router.post('/extract-skills', optionalAuth, extractSkillsFromText);
router.post('/upload', protect, uploadResumeMiddleware, handleFileUpload);

export default router;

