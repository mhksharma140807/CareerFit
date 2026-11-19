import express from 'express';
import {
  getAssessments,
  getAssessmentById,
  startAssessment,
  submitAssessment,
  getAttemptById,
  getMyAttempts,
  startAdaptiveAssessment,
  submitAdaptiveAssessment,
  getAdaptiveFollowUp,
  explainMistakeWithTutor,
} from '../controllers/assessmentController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getAssessments);
router.get('/attempts', protect, getMyAttempts);
router.get('/attempts/:attemptId', protect, getAttemptById);

// Dynamic AI Adaptive Routes (declared before /:id)
router.post('/adaptive/start', protect, startAdaptiveAssessment);
router.post('/adaptive/:id/submit', protect, submitAdaptiveAssessment);
router.post('/adaptive/:id/follow-up', protect, getAdaptiveFollowUp);
router.post('/tutor/explain', protect, explainMistakeWithTutor);

// Standard assessment endpoints
router.get('/:id', getAssessmentById);
router.get('/:id/start', protect, startAssessment);
router.post('/:id/submit', protect, submitAssessment);

export default router;

