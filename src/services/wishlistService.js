import api from './api';

export const wishlistService = {
  getWishlist: () => api.get('/wishlist'),
  
  addToWishlist: (courseId) => api.post('/wishlist', { courseId }),
  
  removeFromWishlist: (courseId) => api.delete(`/wishlist/${courseId}`),
  
  checkWishlist: (courseId) => api.get(`/wishlist/check/${courseId}`),
  
  clearWishlist: () => api.delete('/wishlist'),
};
