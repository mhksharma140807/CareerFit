import express from 'express';
import {
  getImprovementPlan,
  toggleTask,
  addTask,
} from '../controllers/improvementController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getImprovementPlan);
router.patch('/tasks/:taskId', toggleTask);
router.post('/tasks', addTask);

export default router;

