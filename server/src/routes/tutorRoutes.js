import express from 'express';
import {
  getTutorContext,
  startSession,
  submitTurn,
  getMySessions,
  getSession,
} from '../controllers/tutorController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All tutor routes are protected for authenticated students
router.use(protect);

router.get('/context', getTutorContext);
router.post('/session/start', startSession);
router.post('/session/:id/turn', submitTurn);
router.get('/sessions', getMySessions);
router.get('/sessions/:id', getSession);

export default router;
