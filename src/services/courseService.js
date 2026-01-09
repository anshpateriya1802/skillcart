import api from './api';

export const courseService = {
  getAllCourses: (params) => api.get('/courses', { params }),
  
  getCourse: (id) => api.get(`/courses/${id}`),
  
  searchCourses: (search) => api.get('/courses', { params: { search } }),
  
  getCoursesByCategory: (categoryId) => 
    api.get('/courses', { params: { category: categoryId } }),
};
