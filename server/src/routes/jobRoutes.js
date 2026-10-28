import express from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes for listing and inspecting jobs
router.route('/')
  .get(getJobs)
  .post(protect, authorize('admin'), createJob);

router.route('/:id')
  .get(getJobById)
  .put(protect, authorize('admin'), updateJob)
  .delete(protect, authorize('admin'), deleteJob);

export default router;
