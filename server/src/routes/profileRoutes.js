import express from 'express';
import {
  getProfile,
  updateProfile,
  addSkill,
  removeSkill,
} from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All profile endpoints are strictly protected to the authenticated user
router.use(protect);

router.route('/')
  .get(getProfile)
  .put(updateProfile);

router.route('/skills')
  .post(addSkill);

router.route('/skills/:skill')
  .delete(removeSkill);

export default router;
