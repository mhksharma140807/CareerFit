import express from 'express';
import {
  getAdminMetrics,
  getAdminUsers,
  updateUserRole,
  deleteUser,
  getAdminAssessments,
  createAdminAssessment,
  updateAdminAssessment,
  deleteAdminAssessment,
  addQuestion,
  deleteQuestion,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Guard all admin routes strictly to role === 'admin'
router.use(protect, authorize('admin'));

// Metrics
router.get('/metrics', getAdminMetrics);

// Users management
router.get('/users', getAdminUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Assessments management
router.get('/assessments', getAdminAssessments);
router.post('/assessments', createAdminAssessment);
router.put('/assessments/:id', updateAdminAssessment);
router.delete('/assessments/:id', deleteAdminAssessment);
router.post('/assessments/:id/questions', addQuestion);
router.delete('/assessments/:id/questions/:qId', deleteQuestion);

export default router;

