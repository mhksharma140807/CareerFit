import express from 'express';
import {
  generateReport,
  getReportById,
  getMyReports,
  getLatestReport,
  getReadinessIntelligence,
} from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/generate', generateReport);
router.get('/intelligence', getReadinessIntelligence);
router.post('/intelligence', getReadinessIntelligence);
router.get('/', getMyReports);
router.get('/latest', getLatestReport);
router.get('/:id', getReportById);

export default router;

