import { Router } from 'express';
import {
  enrollCourse,
  getMyEnrollments,
  getEnrollment,
  checkEnrollment,
  unenrollCourse,
  getCourseEnrollments,
  markCourseCompleted,
} from '../controller/enrollment.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const enrollmentRouter = Router();

// All routes require authentication
enrollmentRouter.use(authenticate);

// Student routes
enrollmentRouter.post('/', enrollCourse);
enrollmentRouter.get('/my', getMyEnrollments);
enrollmentRouter.get('/check/:courseId', checkEnrollment);
enrollmentRouter.get('/:courseId', getEnrollment);
enrollmentRouter.delete('/:courseId', unenrollCourse);
enrollmentRouter.patch('/:courseId/complete', markCourseCompleted);

// Instructor/Admin routes
enrollmentRouter.get(
  '/course/:courseId',
  authorize('instructor', 'admin'),
  getCourseEnrollments
);

export default enrollmentRouter;
