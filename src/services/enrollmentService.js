import api from './api';

export const enrollmentService = {
  enrollCourse: (courseId) => api.post('/enrollments/enroll', { courseId }),
  
  getMyEnrollments: (status) => api.get('/enrollments/my', { params: { status } }),
  
  getEnrollment: (id) => api.get(`/enrollments/${id}`),
  
  checkEnrollment: (courseId) => api.get(`/enrollments/check/${courseId}`),
};
