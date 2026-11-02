import express from 'express';
import {
  getAssessments,
  getAssessmentById,
  startAssessment,
  submitAssessment,
  getAttemptById,
  getMyAttempts,
} from '../controllers/assessmentController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getAssessments);
router.get('/attempts', protect, getMyAttempts);
router.get('/attempts/:attemptId', protect, getAttemptById);
router.get('/:id', getAssessmentById);
router.get('/:id/start', protect, startAssessment);
router.post('/:id/submit', protect, submitAssessment);

export default router;

