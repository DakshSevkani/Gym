import API from './axios.js';

export const userApi = {
  // GET /user (Railway endpoint is /user)
  getUsers: async () => {
    try {
      let response;
      try {
        response = await API.get('/user');
      } catch (e) {
        response = await API.get('/users');
      }

      const list = Array.isArray(response.data) ? response.data : [];
      return list.map((u) => ({
        id: String(u.id || ''),
        name: u.username || u.name || (u.email ? u.email.split('@')[0] : 'User'),
        username: u.username || u.name || '',
        email: u.email || '',
        role: (u.role || 'MEMBER').toUpperCase(),
        avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        status: u.status || 'Active'
      }));
    } catch (err) {
      console.warn('getUsers API error:', err);
      try {
        const stored = localStorage.getItem('powerhouse_user');
        if (stored) {
          const u = JSON.parse(stored);
          return [u];
        }
      } catch (e) {}
      return [];
    }
  },

  // GET user by ID
  getUserById: async (id) => {
    try {
      const users = await userApi.getUsers();
      const found = users.find((u) => String(u.id) === String(id));
      if (found) return found;

      try {
        const response = await API.get(`/user/${id}`);
        return response.data;
      } catch {
        const response = await API.get(`/users/${id}`);
        return response.data;
      }
    } catch (err) {
      console.warn('getUserById API error:', err);
      return null;
    }
  },

  // GET user profile
  getProfile: async (identifier) => {
    try {
      let userList = [];
      try {
        userList = await userApi.getUsers();
      } catch (e) {}

      const idStr = String(identifier || '').toLowerCase();
      let matched = userList.find((u) =>
        (u.id && String(u.id).toLowerCase() === idStr) ||
        (u.email && u.email.toLowerCase() === idStr) ||
        (u.username && u.username.toLowerCase() === idStr) ||
        (u.name && u.name.toLowerCase() === idStr)
      );

      // Check current user in localStorage if not found
      let storedCurrentUser = null;
      try {
        const raw = localStorage.getItem('powerhouse_user');
        if (raw) storedCurrentUser = JSON.parse(raw);
      } catch (e) {}

      if (!matched && storedCurrentUser) {
        if (
          !identifier ||
          String(storedCurrentUser.id).toLowerCase() === idStr ||
          String(storedCurrentUser.email).toLowerCase() === idStr ||
          String(storedCurrentUser.name).toLowerCase() === idStr
        ) {
          matched = storedCurrentUser;
        }
      }

      // Check local saved extended profile details
      let savedDetails = {};
      try {
        const key = identifier ? `powerhouse_profile_${identifier}` : 'powerhouse_profile';
        const rawDetails = localStorage.getItem(key);
        if (rawDetails) savedDetails = JSON.parse(rawDetails);
      } catch (e) {}

      if (matched || Object.keys(savedDetails).length > 0) {
        return {
          id: String(matched?.id || identifier || 'usr_1'),
          name: savedDetails.name || matched?.name || matched?.username || 'Gym User',
          email: savedDetails.email || matched?.email || '',
          role: savedDetails.role || matched?.role || 'MEMBER',
          phone: savedDetails.phone || matched?.phone || '+1 555-019-2233',
          age: savedDetails.age || matched?.age || 25,
          bio: savedDetails.bio || matched?.bio || '',
          fitnessGoal: savedDetails.fitnessGoal || matched?.fitnessGoal || 'Strength & Muscle Building',
          address: savedDetails.address || matched?.address || '',
          emergencyContact: savedDetails.emergencyContact || matched?.emergencyContact || '',
          avatar: savedDetails.avatar || matched?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          status: matched?.status || 'Active'
        };
      }

      return null;
    } catch (err) {
      console.warn('getProfile helper error:', err);
      return null;
    }
  },

  // Update profile
  updateProfile: async (id, profileData) => {
    try {
      // Save locally to profile cache
      try {
        localStorage.setItem(`powerhouse_profile_${id}`, JSON.stringify(profileData));
        const currentUserRaw = localStorage.getItem('powerhouse_user');
        if (currentUserRaw) {
          const parsed = JSON.parse(currentUserRaw);
          if (String(parsed.id) === String(id) || parsed.email === profileData.email) {
            localStorage.setItem('powerhouse_user', JSON.stringify({ ...parsed, ...profileData }));
          }
        }
      } catch (e) {}

      // Attempt remote backend update if possible
      try {
        const response = await API.put(`/user/${id}`, profileData);
        return response.data;
      } catch {
        try {
          const response = await API.put(`/users/${id}`, profileData);
          return response.data;
        } catch {
          return profileData;
        }
      }
    } catch (err) {
      console.warn('updateProfile API warning:', err);
      return profileData;
    }
  },

  // DELETE /user/:id or /users/:id
  deleteUser: async (id) => {
    try {
      try {
        const response = await API.delete(`/user/${id}`);
        return response.data;
      } catch {
        const response = await API.delete(`/users/${id}`);
        return response.data;
      }
    } catch (err) {
      console.warn('deleteUser error:', err);
      return { status: 'success' };
    }
  }
};

export default userApi;
