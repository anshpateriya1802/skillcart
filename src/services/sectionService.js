import api from './api';

export const sectionService = {
  getCourseSections: (courseId) => api.get(`/sections/course/${courseId}`),
  
  getSection: (sectionId) => api.get(`/sections/${sectionId}`),
};
