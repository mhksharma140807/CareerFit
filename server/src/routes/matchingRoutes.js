import express from 'express';
import { evaluateMatching, getJobMatch, matchCustomJobDescription } from '../controllers/matchingController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public / optional auth for evaluation
router.post('/evaluate', optionalAuth, evaluateMatching);

// Dynamic match against any custom-pasted JD across any domain
router.post('/custom-jd', optionalAuth, matchCustomJobDescription);

// Protected endpoint to evaluate against target job
router.get('/job/:jobId', protect, getJobMatch);

export default router;

