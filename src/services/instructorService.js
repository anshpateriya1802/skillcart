import api from './api';

export const instructorService = {
  // Course Management
  getMyCourses: () => api.get('/courses/instructor/my-courses'),
  
  createCourse: (data) => api.post('/courses', data),
  
  updateCourse: (id, data) => api.put(`/courses/${id}`, data),
  
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  
  togglePublish: (id) => api.patch(`/courses/${id}/publish`),
  
  // Section Management
  getCourseSections: (courseId) => api.get(`/sections/course/${courseId}`),
  
  createSection: (courseId, data) => api.post(`/sections/course/${courseId}`, data),
  
  updateSection: (id, data) => api.put(`/sections/${id}`, data),
  
  deleteSection: (id) => api.delete(`/sections/${id}`),
  
  reorderSections: (courseId, sections) => 
    api.patch(`/sections/course/${courseId}/reorder`, { sections }),
  
  // Lecture Management
  getSectionLectures: (sectionId) => api.get(`/lectures/section/${sectionId}`),
  
  createLecture: (sectionId, data) => api.post(`/lectures/section/${sectionId}`, data),
  
  updateLecture: (id, data) => api.put(`/lectures/${id}`, data),
  
  deleteLecture: (id) => api.delete(`/lectures/${id}`),
  
  reorderLectures: (sectionId, lectures) =>
    api.patch(`/lectures/section/${sectionId}/reorder`, { lectures }),
};
