export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const COURSE_LEVELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const USER_ROLES = {
  student: 'Student',
  instructor: 'Instructor',
  admin: 'Admin',
};

export const PAYMENT_STATUS = {
  pending: 'Pending',
  success: 'Success',
  failed: 'Failed',
  refunded: 'Refunded',
};
