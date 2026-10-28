const API_BASE = '/api';

export const tokenStorage = {
  get: () => localStorage.getItem('careerfit_token') || '',
  set: (token) => localStorage.setItem('careerfit_token', token),
  clear: () => localStorage.removeItem('careerfit_token'),
};

const authHeaders = (token) => {
  const t = token || tokenStorage.get();
  return {
    'Content-Type': 'application/json',
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
};

export const api = {
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch (err) {
      return { success: false, status: 'offline', error: err.message };
    }
  },

  async register(name, email, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (data.token) tokenStorage.set(data.token);
    return data;
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) tokenStorage.set(data.token);
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: authHeaders(),
    });
    return await res.json();
  },

  async getProfile() {
    const res = await fetch(`${API_BASE}/profile`, {
      headers: authHeaders(),
    });
    return await res.json();
  },

  async updateProfile(updates) {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    return await res.json();
  },

  async addSkill(skill) {
    const res = await fetch(`${API_BASE}/profile/skills`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ skill }),
    });
    return await res.json();
  },

  async removeSkill(skill) {
    const res = await fetch(`${API_BASE}/profile/skills/${encodeURIComponent(skill)}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return await res.json();
  },

  async getJobs(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.experienceLevel) query.append('experienceLevel', params.experienceLevel);
    if (params.jobType) query.append('jobType', params.jobType);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/jobs${queryString}`);
    return await res.json();
  },

  async getJobById(id) {
    const res = await fetch(`${API_BASE}/jobs/${id}`);
    return await res.json();
  },
};
