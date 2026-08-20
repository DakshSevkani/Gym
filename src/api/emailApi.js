import API from './axios.js';

export const emailApi = {
  // POST /email/password-reset/request
  requestPasswordReset: async (email) => {
    const response = await API.post('/email/password-reset/request', { email });
    return response.data;
  },

  // POST /email/password-reset/verify
  verifyPasswordReset: async (token, newPassword) => {
    const response = await API.post('/email/password-reset/verify', { token, newPassword });
    return response.data;
  },

  // POST /email/contact
  sendContactMessage: async (contactData) => {
    const response = await API.post('/email/contact', contactData);
    return response.data;
  }
};

export default emailApi;
