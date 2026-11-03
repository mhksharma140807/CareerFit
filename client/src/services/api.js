const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return '/api';
  const trimmed = envUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const API_BASE = getApiBase();

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
  // System Health
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch (err) {
      return { success: false, status: 'offline', error: err.message };
    }
  },

  // Authentication
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

  async changePassword(currentPassword, newPassword) {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return await res.json();
  },

  async getCaptcha() {
    const res = await fetch(`${API_BASE}/auth/captcha`);
    return await res.json();
  },

  async resetPassword({ email, captchaToken, captchaAnswer, newPassword }) {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, captchaToken, captchaAnswer, newPassword }),
    });
    return await res.json();
  },

  // Student Profile
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

  // Jobs
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

  async createJob(jobData) {
    const res = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(jobData),
    });
    return await res.json();
  },

  async updateJob(id, jobData) {
    const res = await fetch(`${API_BASE}/jobs/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(jobData),
    });
    return await res.json();
  },

  async deleteJob(id) {
    const res = await fetch(`${API_BASE}/jobs/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return await res.json();
  },

  // Matching
  async evaluateMatching(body) {
    const res = await fetch(`${API_BASE}/matching/evaluate`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    return await res.json();
  },

  async getJobMatch(jobId) {
    const res = await fetch(`${API_BASE}/matching/job/${jobId}`, {
      headers: authHeaders(),
    });
    return await res.json();
  },

  // Assessments
  async getAssessments(category) {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    const res = await fetch(`${API_BASE}/assessments${query}`, {
      headers: authHeaders(),
    });
    return await res.json();
  },

  async getAssessmentById(id) {
    const res = await fetch(`${API_BASE}/assessments/${id}`);
    return await res.json();
  },

  async startAssessment(id) {
    const res = await fetch(`${API_BASE}/assessments/${id}/start`, {
      headers: authHeaders(),
    });
    return await res.json();
  },

  async submitAssessment(id, answers) {
    const res = await fetch(`${API_BASE}/assessments/${id}/submit`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ answers }),
    });
    return await res.json();
  },

  async getAttemptById(attemptId) {
    const res = await fetch(`${API_BASE}/assessments/attempts/${attemptId}`, {
      headers: authHeaders(),
    });
    return await res.json();
  },

  async getMyAttempts() {
    const res = await fetch(`${API_BASE}/assessments/attempts`, {
      headers: authHeaders(),
    });
    return await res.json();
  },

  // Career Readiness Reports
  async generateReport(jobId) {
    const res = await fetch(`${API_BASE}/reports/generate`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ jobId }),
    });
    return await res.json();
  },

  async getReportById(reportId) {
    const res = await fetch(`${API_BASE}/reports/${reportId}`, {
      headers: authHeaders(),
    });
    return await res.json();
  },

  async getMyReports() {
    const res = await fetch(`${API_BASE}/reports`, {
      headers: authHeaders(),
    });
    return await res.json();
  },

  async getLatestReport() {
    const res = await fetch(`${API_BASE}/reports/latest`, {
      headers: authHeaders(),
    });
    return await res.json();
  },

  // Improvement Plan
  async getImprovementPlan() {
    const res = await fetch(`${API_BASE}/improvement-plan`, {
      headers: authHeaders(),
    });
    return await res.json();
  },

  async toggleImprovementTask(taskId) {
    const res = await fetch(`${API_BASE}/improvement-plan/tasks/${taskId}`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    return await res.json();
  },

  async addImprovementTask(taskData) {
    const res = await fetch(`${API_BASE}/improvement-plan/tasks`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(taskData),
    });
    return await res.json();
  },

  // Saved Jobs
  async getSavedJobs() {
    const res = await fetch(`${API_BASE}/saved-jobs`, {
      headers: authHeaders(),
    });
    return await res.json();
  },

  async saveJob(jobId) {
    const res = await fetch(`${API_BASE}/saved-jobs/${jobId}`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return await res.json();
  },

  async removeSavedJob(jobId) {
    const res = await fetch(`${API_BASE}/saved-jobs/${jobId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return await res.json();
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: authHeaders(),
    });
    return await res.json();
  },

  async markNotificationRead(id) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    return await res.json();
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    return await res.json();
  },

  async clearNotifications() {
    const res = await fetch(`${API_BASE}/notifications/clear`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return await res.json();
  },

  // Progress
  async getProgress() {
    const res = await fetch(`${API_BASE}/progress`, {
      headers: authHeaders(),
    });
    return await res.json();
  },

  // Resume
  async extractSkills(text, saveToProfile = false) {
    const res = await fetch(`${API_BASE}/resume/extract-skills`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ text, saveToProfile }),
    });
    return await res.json();
  },

  async uploadResumeFile(formData) {
    const t = tokenStorage.get();
    const res = await fetch(`${API_BASE}/resume/upload`, {
      method: 'POST',
      headers: {
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
      body: formData,
    });
    return await res.json();
  },

  // Admin Suite
  async getAdminMetrics() {
    const res = await fetch(`${API_BASE}/admin/metrics`, {
      headers: authHeaders(),
    });
    return await res.json();
  },

  async getAdminUsers(search, role) {
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (role) query.append('role', role);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/admin/users${qs}`, {
      headers: authHeaders(),
    });
    return await res.json();
  },

  async updateAdminUserRole(id, role) {
    const res = await fetch(`${API_BASE}/admin/users/${id}/role`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ role }),
    });
    return await res.json();
  },

  async deleteAdminUser(id) {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return await res.json();
  },

  async getAdminAssessments() {
    const res = await fetch(`${API_BASE}/admin/assessments`, {
      headers: authHeaders(),
    });
    return await res.json();
  },

  async createAdminAssessment(assessmentData) {
    const res = await fetch(`${API_BASE}/admin/assessments`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(assessmentData),
    });
    return await res.json();
  },

  async updateAdminAssessment(id, assessmentData) {
    const res = await fetch(`${API_BASE}/admin/assessments/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(assessmentData),
    });
    return await res.json();
  },

  async deleteAdminAssessment(id) {
    const res = await fetch(`${API_BASE}/admin/assessments/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return await res.json();
  },

  async addAdminQuestion(assessmentId, questionData) {
    const res = await fetch(`${API_BASE}/admin/assessments/${assessmentId}/questions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(questionData),
    });
    return await res.json();
  },

  async deleteAdminQuestion(assessmentId, questionId) {
    const res = await fetch(`${API_BASE}/admin/assessments/${assessmentId}/questions/${questionId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return await res.json();
  },
};
