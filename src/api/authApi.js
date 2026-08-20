import API from './axios.js';

export const authApi = {
  // POST /user/register
  register: async (userData) => {
    // Railway backend endpoint: POST /user/register
    const payload = {
      username: userData.name || userData.username || userData.email.split('@')[0],
      name: userData.name || userData.username || userData.email.split('@')[0],
      email: userData.email,
      password: userData.password,
      role: userData.role || 'MEMBER'
    };

    let response;
    try {
      response = await API.post('/user/register', payload);
    } catch (err) {
      // Fallback endpoint if needed
      response = await API.post('/users/register', payload);
    }

    const data = response.data;
    const token = data.token || data.accessToken || data.jwt || '';
    const user = {
      id: data.id || `usr_${Date.now()}`,
      name: data.username || data.name || payload.name,
      email: data.email || payload.email,
      role: data.role || payload.role,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    };

    if (token) {
      localStorage.setItem('powerhouse_jwt_token', token);
      localStorage.setItem('powerhouse_user', JSON.stringify(user));
    }
    return { ...data, token, user };
  },

  // POST /user/login
  login: async (credentials) => {
    // Railway backend endpoint: POST /user/login
    const payload = {
      username: credentials.email || credentials.username,
      email: credentials.email,
      password: credentials.password
    };

    let response;
    try {
      response = await API.post('/user/login', payload);
    } catch (err) {
      // Only retry alternative route if the endpoint itself was 404 Not Found
      if (err.response && err.response.status === 404) {
        response = await API.post('/users/login', payload);
      } else {
        throw err;
      }
    }

    const data = response.data;
    const token = data.token || data.accessToken || data.jwt || '';
    const user = {
      id: data.id || `usr_${Date.now()}`,
      name: data.username || data.name || credentials.email.split('@')[0],
      email: data.email || credentials.email,
      role: data.role || 'MEMBER',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    };

    if (token) {
      localStorage.setItem('powerhouse_jwt_token', token);
      localStorage.setItem('powerhouse_user', JSON.stringify(user));
    }
    return { ...data, token, user };
  },

  logout: () => {
    localStorage.removeItem('powerhouse_jwt_token');
    localStorage.removeItem('powerhouse_user');
    sessionStorage.clear();
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('powerhouse_user');
    const token = localStorage.getItem('powerhouse_jwt_token');
    if (!userStr || !token) return null;
    try {
      const parsed = JSON.parse(userStr);
      if (!parsed || !parsed.email) return null;
      return parsed;
    } catch {
      return null;
    }
  }
};

export default authApi;
