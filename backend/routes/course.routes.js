import { Router } from 'express';
import {
  createCourse,
  getAllCourses,
  getCourse,
  getInstructorCourses,
  updateCourse,
  deleteCourse,
  togglePublish,
} from '../controller/course.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const courseRouter = Router();

// Public routes
courseRouter.get('/', getAllCourses);
courseRouter.get('/:id', getCourse);

// Instructor routes
courseRouter.post('/', authenticate, authorize('instructor', 'admin'), createCourse);
courseRouter.get('/instructor/my-courses', authenticate, authorize('instructor', 'admin'), getInstructorCourses);
courseRouter.put('/:id', authenticate, authorize('instructor', 'admin'), updateCourse);
courseRouter.delete('/:id', authenticate, authorize('instructor', 'admin'), deleteCourse);
courseRouter.patch('/:id/publish', authenticate, authorize('instructor', 'admin'), togglePublish);

export default courseRouter;
