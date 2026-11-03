import express from 'express';
import {
  register,
  login,
  getMe,
  changePassword,
  getCaptcha,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);
router.get('/captcha', getCaptcha);
router.post('/reset-password', resetPassword);

export default router;
