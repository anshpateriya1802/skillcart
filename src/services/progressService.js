import api from './api';

export const progressService = {
  getMyProgress: () => api.get('/progress/my'),
  
  getCourseProgress: (courseId) => api.get(`/progress/${courseId}`),
  
  toggleLectureCompletion: (courseId, lectureId) => 
    api.post(`/progress/${courseId}/toggle`, { lectureId }),
  
  resetProgress: (courseId) => api.delete(`/progress/${courseId}/reset`),
};
