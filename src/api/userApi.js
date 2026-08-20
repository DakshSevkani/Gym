import API from './axios.js';

export const userApi = {
  // GET /users
  getUsers: async () => {
    try {
      const response = await API.get('/users');
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.warn('getUsers API error:', err);
      return [];
    }
  },

  // GET /users/:id
  getUserById: async (id) => {
    try {
      const response = await API.get(`/users/${id}`);
      return response.data;
    } catch (err) {
      console.warn('getUserById API error:', err);
      return null;
    }
  },

  // GET /user/profile
  getProfile: async (identifier) => {
    try {
      const response = await API.get('/user/profile', {
        params: identifier ? { identifier } : {}
      });
      return response.data;
    } catch (err) {
      console.warn('getProfile API error:', err);
      return null;
    }
  },

  // PUT /users/:id or PUT /user/profile
  updateProfile: async (id, profileData) => {
    try {
      const response = await API.put(`/users/${id}`, profileData);
      return response.data;
    } catch (err) {
      console.warn('updateProfile API error:', err);
      throw err;
    }
  },

  // DELETE /users/:id
  deleteUser: async (id) => {
    const response = await API.delete(`/users/${id}`);
    return response.data;
  }
};

export default userApi;
