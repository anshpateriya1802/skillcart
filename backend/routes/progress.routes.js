import { Router } from 'express';
import {
  getCourseProgress,
  getMyProgress,
  toggleLectureCompletion,
  resetProgress,
} from '../controller/progress.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const progressRouter = Router();

// All routes require authentication
progressRouter.use(authenticate);

// Get all progress for user
progressRouter.get('/my', getMyProgress);

// Course-specific progress
progressRouter.get('/:courseId', getCourseProgress);
progressRouter.post('/:courseId/toggle', toggleLectureCompletion);
progressRouter.delete('/:courseId/reset', resetProgress);

export default progressRouter;
