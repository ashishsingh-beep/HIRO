export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ROUTES = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  ME: `${API_BASE_URL}/api/auth/me`,
  ENTRIES: `${API_BASE_URL}/api/entries`,
  POSITIONS: `${API_BASE_URL}/api/positions`,
  REPORTS: `${API_BASE_URL}/api/entries/reports`,
  DASHBOARD: `${API_BASE_URL}/api/dashboard`,
  ADMIN_EXISTS: `${API_BASE_URL}/api/auth/admin-exists`,
  RECRUITERS: `${API_BASE_URL}/api/auth/recruiters`
};
