import { Router } from 'express';
import { signup, signin, getMe } from '../controller/auth.controller.js';
import {
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controller/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const userRouter = Router();

// Public routes
userRouter.post('/signup', signup);
userRouter.post('/signin', signin);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', resetPassword);

// Protected routes
userRouter.get('/me', authenticate, getMe);
userRouter.get('/profile', authenticate, getProfile);
userRouter.patch('/profile', authenticate, updateProfile);
userRouter.post('/change-password', authenticate, changePassword);

export default userRouter;
