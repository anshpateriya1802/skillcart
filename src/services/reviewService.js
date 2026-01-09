import api from './api';

export const reviewService = {
  getCourseReviews: (courseId, params) => 
    api.get(`/reviews/course/${courseId}`, { params }),
  
  createReview: (data) => api.post('/reviews', data),
  
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),
  
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};
