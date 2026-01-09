import api from './api';

export const paymentService = {
  createOrder: (courseId) => {
    console.log('Creating order for courseId:', courseId);
    return api.post('/payments/create-order', { courseId });
  },
  
  verifyPayment: (paymentData) => api.post('/payments/verify', paymentData),
  
  getMyPayments: () => api.get('/payments/my'),
  
  getPayment: (id) => api.get(`/payments/${id}`),
};
