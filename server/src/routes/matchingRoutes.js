import express from 'express';
import { evaluateMatching, getJobMatch } from '../controllers/matchingController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public / optional auth for evaluation
router.post('/evaluate', optionalAuth, evaluateMatching);

// Protected endpoint to evaluate against target job
router.get('/job/:jobId', protect, getJobMatch);

export default router;

