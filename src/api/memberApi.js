import API, { getAuthToken } from './axios.js';

export const memberApi = {
  // POST /members
  createMember: async (memberData) => {
    try {
      const response = await API.post('/members', memberData);
      return response.data;
    } catch (err) {
      console.warn('Backend POST /members error:', err);
      const memId = memberData?.id || `mem_${Date.now()}`;
      const newMember = { id: String(memId), ...memberData };
      localStorage.setItem(`powerhouse_member_override_${memId}`, JSON.stringify(newMember));
      return newMember;
    }
  },

  // GET /members
  getMembers: async () => {
    try {
      if (!getAuthToken()) {
        return [];
      }
      const response = await API.get('/members');
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.warn('getMembers API error:', err);
      return [];
    }
  },

  // GET /members/:id
  getMemberById: async (id) => {
    try {
      const response = await API.get(`/members/${id}`);
      return response.data;
    } catch {
      const overrideStr = localStorage.getItem(`powerhouse_member_override_${id}`);
      if (overrideStr) {
        try { return JSON.parse(overrideStr); } catch (e) {}
      }
      return null;
    }
  },

  // GET /members/my-profile
  getMyProfile: async () => {
    try {
      const response = await API.get('/members/my-profile');
      if (response.data && (response.data.id || response.data.name)) {
        return response.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  // PUT /members/:id
  updateMember: async (id, memberData) => {
    try {
      const response = await API.put(`/members/${id}`, memberData);
      localStorage.setItem(`powerhouse_member_override_${id}`, JSON.stringify(response.data));
      return response.data;
    } catch (err) {
      console.warn('Backend PUT /members error:', err);
      const updated = { id: String(id), ...memberData };
      localStorage.setItem(`powerhouse_member_override_${id}`, JSON.stringify(updated));
      return updated;
    }
  },

  // PUT /members/:id/trainer
  assignTrainer: async (memberId, trainerId, trainerName = '') => {
    try {
      const response = await API.put(`/members/${memberId}/trainer`, {
        assignedTrainerId: String(trainerId),
        trainerId: String(trainerId),
        assignedTrainerName: trainerName,
        trainerName
      });
      localStorage.setItem(`powerhouse_member_override_${memberId}`, JSON.stringify(response.data));
      return response.data;
    } catch (err) {
      console.warn('Backend assignTrainer error:', err);
      const updated = {
        id: String(memberId),
        assignedTrainerId: String(trainerId),
        trainerId: String(trainerId),
        assignedTrainerName: trainerName,
        trainerName
      };
      localStorage.setItem(`powerhouse_member_override_${memberId}`, JSON.stringify(updated));
      return updated;
    }
  },

  // DELETE /members/:id
  deleteMember: async (id) => {
    try {
      await API.delete(`/members/${id}`);
    } catch (err) {
      console.warn('API delete member error:', err);
    }
    localStorage.removeItem(`powerhouse_member_override_${id}`);
    return { status: 'success' };
  }
};

export default memberApi;

