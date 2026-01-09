import api from './api';

export const categoryService = {
  getAllCategories: () => api.get('/categories'),
  
  getCategory: (id) => api.get(`/categories/${id}`),
};
