import { Router } from 'express';
import {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controller/category.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const categoryRouter = Router();

// Public routes
categoryRouter.get('/', getAllCategories);
categoryRouter.get('/:id', getCategory);

// Admin only routes
categoryRouter.post('/', authenticate, authorize('admin'), createCategory);
categoryRouter.put('/:id', authenticate, authorize('admin'), updateCategory);
categoryRouter.delete('/:id', authenticate, authorize('admin'), deleteCategory);

export default categoryRouter;
