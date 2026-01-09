import { create } from 'zustand';
import { courseService } from '../services/courseService';

export const useCourseStore = create((set) => ({
  courses: [],
  currentCourse: null,
  loading: false,
  error: null,
  pagination: null,

  fetchCourses: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await courseService.getAllCourses(params);
      set({ 
        courses: response.data.courses, 
        pagination: response.data.pagination,
        loading: false 
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchCourse: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await courseService.getCourse(id);
      set({ currentCourse: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  searchCourses: async (query) => {
    set({ loading: true, error: null });
    try {
      const response = await courseService.searchCourses(query);
      set({ courses: response.data.courses, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  clearCurrentCourse: () => set({ currentCourse: null }),
}));
