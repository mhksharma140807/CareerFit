import express from 'express';
import { getSavedJobs, saveJob, removeSavedJob } from '../controllers/savedJobController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getSavedJobs);
router.post('/:jobId', saveJob);
router.delete('/:jobId', removeSavedJob);

export default router;

