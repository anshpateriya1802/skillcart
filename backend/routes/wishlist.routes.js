import { Router } from 'express';
import {
  getMyWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  clearWishlist,
} from '../controller/wishlist.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const wishlistRouter = Router();

// All routes require authentication
wishlistRouter.use(authenticate);

wishlistRouter.get('/', getMyWishlist);
wishlistRouter.post('/', addToWishlist);
wishlistRouter.delete('/:courseId', removeFromWishlist);
wishlistRouter.get('/check/:courseId', checkWishlist);
wishlistRouter.delete('/', clearWishlist);

export default wishlistRouter;
