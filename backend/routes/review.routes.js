import { Router } from 'express';
import {
  createReview,
  updateReview,
  deleteReview,
  getCourseReviews,
  getMyReview,
  getMyReviews,
} from '../controller/review.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const reviewRouter = Router();

// Public routes
reviewRouter.get('/course/:courseId', getCourseReviews);

// Protected routes
reviewRouter.use(authenticate);

// User review management
reviewRouter.get('/my', getMyReviews);
reviewRouter.get('/my/:courseId', getMyReview);
reviewRouter.post('/:courseId', createReview);
reviewRouter.put('/:courseId', updateReview);
reviewRouter.delete('/:courseId', deleteReview);

export default reviewRouter;
