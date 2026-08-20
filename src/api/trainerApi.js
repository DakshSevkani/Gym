import API from './axios.js';

export const trainerApi = {
  // POST /trainers
  createTrainer: async (trainerData) => {
    const response = await API.post('/trainers', trainerData);
    return response.data;
  },

  // GET /trainers
  getTrainers: async () => {
    try {
      const response = await API.get('/trainers');
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.warn('getTrainers API error:', err);
      return [];
    }
  },

  // GET /trainers/:id
  getTrainerById: async (id) => {
    try {
      const response = await API.get(`/trainers/${id}`);
      return response.data;
    } catch {
      return null;
    }
  },

  // GET /trainers/my-profile
  getMyProfile: async () => {
    try {
      const response = await API.get('/trainers/my-profile');
      if (response.data && (response.data.id || response.data.name)) {
        return response.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  // PUT /trainers/:id
  updateTrainer: async (id, trainerData) => {
    const response = await API.put(`/trainers/${id}`, trainerData);
    return response.data;
  },

  // DELETE /trainers/:id
  deleteTrainer: async (id) => {
    const response = await API.delete(`/trainers/${id}`);
    return response.data;
  }
};

export default trainerApi;
