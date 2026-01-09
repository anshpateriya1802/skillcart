import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  getMyPayments,
  getPayment,
  getCoursePayments,
} from '../controller/payment.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const paymentRouter = Router();

// All routes require authentication
paymentRouter.use(authenticate);

// Student routes
paymentRouter.post('/create-order', createOrder);
paymentRouter.post('/verify', verifyPayment);
paymentRouter.get('/my', getMyPayments);
paymentRouter.get('/:id', getPayment);

// Instructor/Admin routes
paymentRouter.get(
  '/course/:courseId',
  authorize('instructor', 'admin'),
  getCoursePayments
);

export default paymentRouter;
