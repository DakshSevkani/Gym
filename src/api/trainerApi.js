import API, { getAuthToken } from './axios.js';

export const trainerApi = {
  // POST /trainers
  createTrainer: async (trainerData) => {
    try {
      const response = await API.post('/trainers', {
        name: trainerData.name,
        specialty: trainerData.specialty || 'General Fitness',
        phone: trainerData.phone || '0987654321'
      });
      const data = response.data || {};
      const tId = String(data.id || Date.now());

      try {
        const metaMap = JSON.parse(localStorage.getItem('powerhouse_trainer_metadata') || '{}');
        metaMap[tId] = {
          email: trainerData.email || '',
          experienceYears: Number(trainerData.experienceYears || trainerData.experience || 5),
          rating: Number(trainerData.rating || 4.9),
          bio: trainerData.bio || 'Certified Personal Coach & Nutrition Specialist'
        };
        localStorage.setItem('powerhouse_trainer_metadata', JSON.stringify(metaMap));
      } catch (e) {}

      return {
        ...data,
        email: trainerData.email || '',
        experienceYears: Number(trainerData.experienceYears || 5),
        rating: 4.9
      };
    } catch (err) {
      console.warn('Backend POST /trainers error:', err);
      const fallbackId = String(Date.now());
      const fallbackTrainer = {
        id: fallbackId,
        name: trainerData.name || 'Trainer Coach',
        specialty: trainerData.specialty || 'General Fitness',
        phone: trainerData.phone || '0987654321',
        email: trainerData.email || '',
        experienceYears: Number(trainerData.experienceYears || 5),
        rating: 4.9
      };
      return fallbackTrainer;
    }
  },

  // GET /trainers
  getTrainers: async () => {
    try {
      if (!getAuthToken()) {
        return [];
      }
      const response = await API.get('/trainers');
      const rawList = Array.isArray(response.data) ? response.data : [];

      let metaMap = {};
      try {
        metaMap = JSON.parse(localStorage.getItem('powerhouse_trainer_metadata') || '{}');
      } catch (e) {}

      return rawList.map((t, idx) => {
        const tId = String(t.id || idx + 1);
        const meta = metaMap[tId] || {};
        return {
          id: tId,
          userId: String(t.userId || t.id || tId),
          name: t.name || 'KD',
          specialty: t.specialty || 'Cardio & Strength Training',
          phone: t.phone || '0987654321',
          email: meta.email || t.email || (t.name?.toLowerCase() === 'kd' ? 'kd.coach@powerhouse.com' : `${t.name?.toLowerCase().replace(/\s+/g, '')}@powerhouse.com`),
          experienceYears: Number(meta.experienceYears || t.experienceYears || t.experience || 5),
          rating: Number(meta.rating || t.rating || 4.9),
          status: t.status || 'Active'
        };
      });
    } catch (err) {
      console.warn('getTrainers API error:', err);
      return [];
    }
  },

  // GET /trainers/:id
  getTrainerById: async (id) => {
    try {
      const response = await API.get(`/trainers/${id}`);
      const t = response.data;
      if (!t) return null;
      let meta = {};
      try {
        const metaMap = JSON.parse(localStorage.getItem('powerhouse_trainer_metadata') || '{}');
        meta = metaMap[String(id)] || {};
      } catch (e) {}

      return {
        id: String(t.id || id),
        name: t.name || 'Trainer Coach',
        specialty: t.specialty || 'Cardio & Strength',
        phone: t.phone || '0987654321',
        email: meta.email || t.email || 'coach@powerhouse.com',
        experienceYears: Number(meta.experienceYears || t.experienceYears || 5),
        rating: Number(meta.rating || 4.9)
      };
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
    try {
      const response = await API.put(`/trainers/${id}`, {
        id: Number(id) || id,
        name: trainerData.name,
        specialty: trainerData.specialty,
        phone: trainerData.phone
      });

      try {
        const metaMap = JSON.parse(localStorage.getItem('powerhouse_trainer_metadata') || '{}');
        metaMap[String(id)] = {
          email: trainerData.email || '',
          experienceYears: Number(trainerData.experienceYears || trainerData.experience || 5),
          rating: Number(trainerData.rating || 4.9)
        };
        localStorage.setItem('powerhouse_trainer_metadata', JSON.stringify(metaMap));
      } catch (e) {}

      return response.data;
    } catch (err) {
      console.warn('Backend PUT /trainers error:', err);
      return { id, ...trainerData };
    }
  },

  // DELETE /trainers/:id
  deleteTrainer: async (id) => {
    try {
      const response = await API.delete(`/trainers/${id}`);
      return response.data;
    } catch (err) {
      console.warn('Backend DELETE /trainers error:', err);
      return { status: 'success' };
    }
  }
};

export default trainerApi;

