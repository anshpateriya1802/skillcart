import { Router } from 'express';
import {
  getSectionLectures,
  getLecture,
  createLecture,
  updateLecture,
  deleteLecture,
  reorderLectures,
} from '../controller/lecture.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const lectureRouter = Router();

// Public/Student routes (with enrollment checks in controller)
lectureRouter.get('/section/:sectionId', getSectionLectures);
lectureRouter.get('/:id', getLecture);

// Instructor/Admin routes
lectureRouter.use(authenticate, authorize('instructor', 'admin'));
lectureRouter.post('/section/:sectionId', createLecture);
lectureRouter.put('/:id', updateLecture);
lectureRouter.delete('/:id', deleteLecture);
lectureRouter.patch('/section/:sectionId/reorder', reorderLectures);

export default lectureRouter;
