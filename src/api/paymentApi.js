import API from './axios.js';

export const paymentApi = {
  // POST /payments
  createPayment: async (paymentData) => {
    try {
      const response = await API.post('/payments', paymentData);
      return response.data;
    } catch (err) {
      console.warn('Backend POST /payments call failed:', err);
      throw err;
    }
  },

  // GET /payments
  getPayments: async () => {
    try {
      const response = await API.get('/payments');
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.warn('Backend GET /payments call failed:', err);
      return [];
    }
  },

  // GET /payments/:id
  getPaymentById: async (id) => {
    try {
      const response = await API.get(`/payments/${id}`);
      return response.data;
    } catch (err) {
      console.warn('Backend GET /payments/:id failed:', err);
      return null;
    }
  },

  // DELETE /payments/:id
  deletePayment: async (id) => {
    try {
      const response = await API.delete(`/payments/${id}`);
      return response.data;
    } catch (err) {
      console.warn('Backend DELETE /payments/:id failed:', err);
      throw err;
    }
  }
};

export default paymentApi;
