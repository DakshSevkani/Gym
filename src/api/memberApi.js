import API, { getAuthToken } from './axios.js';

export const memberApi = {
  // POST /members
  createMember: async (memberData) => {
    try {
      const payload = {
        name: memberData.name,
        phone: memberData.phone || '',
        membershipType: memberData.membershipType || memberData.tier || 'Pro Quarter',
        membershipStartDate: memberData.membershipStartDate || memberData.startDate || new Date().toISOString().split('T')[0],
        membershipEndDate: memberData.membershipEndDate || memberData.expirationDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]
      };

      if (memberData.assignedTrainerId || memberData.trainerId) {
        payload.trainer = { id: Number(memberData.assignedTrainerId || memberData.trainerId) || 1 };
      }

      const response = await API.post('/members', payload);
      const resData = response.data || {};
      const newId = String(resData.id || Date.now());

      // Save trainer mapping
      if (memberData.assignedTrainerId || memberData.assignedTrainerName) {
        try {
          const map = JSON.parse(localStorage.getItem('powerhouse_member_trainer_map') || '{}');
          map[newId] = {
            trainerId: String(memberData.assignedTrainerId || '1'),
            trainerName: memberData.assignedTrainerName || 'KD',
            email: memberData.email || ''
          };
          localStorage.setItem('powerhouse_member_trainer_map', JSON.stringify(map));
        } catch (e) {}
      }

      return {
        ...resData,
        id: newId,
        email: memberData.email || '',
        assignedTrainerId: String(memberData.assignedTrainerId || '1'),
        assignedTrainerName: memberData.assignedTrainerName || 'KD'
      };
    } catch (err) {
      console.warn('Backend POST /members error:', err);
      const memId = String(memberData?.id || Date.now());
      const newMember = {
        id: memId,
        ...memberData,
        assignedTrainerId: String(memberData.assignedTrainerId || '1'),
        assignedTrainerName: memberData.assignedTrainerName || 'KD'
      };
      try {
        const map = JSON.parse(localStorage.getItem('powerhouse_member_trainer_map') || '{}');
        map[memId] = {
          trainerId: String(memberData.assignedTrainerId || '1'),
          trainerName: memberData.assignedTrainerName || 'KD',
          email: memberData.email || ''
        };
        localStorage.setItem('powerhouse_member_trainer_map', JSON.stringify(map));
      } catch (e) {}
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
      const rawList = Array.isArray(response.data) ? response.data : [];

      let trainerMap = {};
      try {
        trainerMap = JSON.parse(localStorage.getItem('powerhouse_member_trainer_map') || '{}');
      } catch (e) {}

      return rawList.map((m, idx) => {
        const mId = String(m.id || idx + 1);
        const mapEntry = trainerMap[mId] || trainerMap[String(m.name).toLowerCase()] || {};

        // Default trainer assignment: KD (id: 1, Cardio & Strength)
        const assignedTrainerId = mapEntry.trainerId || (m.trainer ? String(m.trainer.id) : (m.trainerId ? String(m.trainerId) : '1'));
        const assignedTrainerName = mapEntry.trainerName || (m.trainer ? m.trainer.name : (m.trainerName ? m.trainerName : 'KD'));
        const email = mapEntry.email || m.email || (m.name?.toLowerCase() === 'sachin' ? 'sachin.member@powerhouse.com' : (m.name?.toLowerCase() === 'krishna' ? 'krishnasevkani99@gmail.com' : ''));

        return {
          ...m,
          id: mId,
          userId: String(m.userId || m.id || mId),
          email,
          tier: m.membershipType || m.tier || 'Pro Quarter',
          startDate: m.membershipStartDate || m.startDate || '2026-08-20',
          expirationDate: m.membershipEndDate || m.expirationDate || '2026-11-20',
          assignedTrainerId,
          assignedTrainerName
        };
      });
    } catch (err) {
      console.warn('getMembers API error:', err);
      return [];
    }
  },

  // GET /members/:id
  getMemberById: async (id) => {
    try {
      const response = await API.get(`/members/${id}`);
      const m = response.data;
      if (!m) return null;

      let trainerMap = {};
      try {
        trainerMap = JSON.parse(localStorage.getItem('powerhouse_member_trainer_map') || '{}');
      } catch (e) {}

      const mId = String(m.id || id);
      const mapEntry = trainerMap[mId] || trainerMap[String(m.name).toLowerCase()] || {};

      return {
        ...m,
        id: mId,
        email: mapEntry.email || m.email || '',
        assignedTrainerId: mapEntry.trainerId || '1',
        assignedTrainerName: mapEntry.trainerName || 'KD'
      };
    } catch {
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
      const payload = {
        id: Number(id) || id,
        name: memberData.name,
        phone: memberData.phone || '',
        membershipType: memberData.membershipType || memberData.tier || 'Pro Quarter',
        membershipStartDate: memberData.membershipStartDate || memberData.startDate,
        membershipEndDate: memberData.membershipEndDate || memberData.expirationDate,
        trainer: { id: Number(memberData.assignedTrainerId || memberData.trainerId) || 1 }
      };

      const response = await API.put(`/members/${id}`, payload);

      // Save trainer assignment & email mapping
      try {
        const map = JSON.parse(localStorage.getItem('powerhouse_member_trainer_map') || '{}');
        map[String(id)] = {
          trainerId: String(memberData.assignedTrainerId || memberData.trainerId || '1'),
          trainerName: memberData.assignedTrainerName || memberData.trainerName || 'KD',
          email: memberData.email || ''
        };
        map[String(memberData.name).toLowerCase()] = map[String(id)];
        localStorage.setItem('powerhouse_member_trainer_map', JSON.stringify(map));
      } catch (e) {}

      return response.data;
    } catch (err) {
      console.warn('Backend PUT /members error:', err);
      try {
        const map = JSON.parse(localStorage.getItem('powerhouse_member_trainer_map') || '{}');
        map[String(id)] = {
          trainerId: String(memberData.assignedTrainerId || memberData.trainerId || '1'),
          trainerName: memberData.assignedTrainerName || memberData.trainerName || 'KD',
          email: memberData.email || ''
        };
        localStorage.setItem('powerhouse_member_trainer_map', JSON.stringify(map));
      } catch (e) {}
      return { id: String(id), ...memberData };
    }
  },

  // Assign trainer
  assignTrainer: async (memberId, trainerId, trainerName = '') => {
    const sId = String(memberId);
    const sTrnId = String(trainerId || '1');
    const trnName = trainerName || 'KD';

    // 1. Save in localStorage trainer map
    try {
      const map = JSON.parse(localStorage.getItem('powerhouse_member_trainer_map') || '{}');
      map[sId] = {
        trainerId: sTrnId,
        trainerName: trnName,
        email: map[sId]?.email || ''
      };
      localStorage.setItem('powerhouse_member_trainer_map', JSON.stringify(map));
    } catch (e) {}

    // 2. Try updating backend member with trainer
    try {
      const mRes = await API.get(`/members/${memberId}`);
      const cur = mRes.data || {};
      await API.put(`/members/${memberId}`, {
        id: Number(memberId) || memberId,
        name: cur.name,
        phone: cur.phone,
        membershipType: cur.membershipType,
        membershipStartDate: cur.membershipStartDate,
        membershipEndDate: cur.membershipEndDate,
        trainer: { id: Number(trainerId) || 1 }
      });
    } catch (err) {
      console.warn('Backend update trainer error:', err);
    }

    return {
      id: sId,
      assignedTrainerId: sTrnId,
      assignedTrainerName: trnName
    };
  },

  // DELETE /members/:id
  deleteMember: async (id) => {
    try {
      await API.delete(`/members/${id}`);
    } catch (err) {
      console.warn('API delete member error:', err);
    }
    try {
      const map = JSON.parse(localStorage.getItem('powerhouse_member_trainer_map') || '{}');
      delete map[String(id)];
      localStorage.setItem('powerhouse_member_trainer_map', JSON.stringify(map));
    } catch (e) {}
    return { status: 'success' };
  }
};

export default memberApi;

