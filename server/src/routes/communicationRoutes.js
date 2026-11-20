import express from 'express';
import {
  getScenarios,
  generateScenario,
  evaluateResponse,
  getMyCommunicationHistory,
  getCommunicationAttemptById,
} from '../controllers/communicationController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Catalog & Scenario Generation
router.get('/scenarios', optionalAuth, getScenarios);
router.post('/scenarios/generate', optionalAuth, generateScenario);

// Evaluation & Attempt History (Protected)
router.post('/evaluate', protect, evaluateResponse);
router.get('/attempts', protect, getMyCommunicationHistory);
router.get('/attempts/:id', protect, getCommunicationAttemptById);

export default router;
