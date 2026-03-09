/**
 * Frontend env – all API calls that connect to the Django backend.
 * Set VITE_API_BASE_URL in .env (see .env.example). Vite only exposes VITE_* to the client.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

/**
 * Build full backend URL for an API path.
 * Use this for every request to the backend (login, etc.).
 * @param {string} path - e.g. '/api/users/login/'
 * @returns {string} - e.g. 'http://127.0.0.1:8000/api/users/login/'
 */
export function apiUrl(path) {
  const base = API_BASE_URL.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

/** Backend API paths used by the frontend. */
export const API_PATHS = {
  LOGIN: '/api/users/login/',
  USER_ME: '/api/users/me/',
  USERS_LIST: '/api/users/',
  DASHBOARD_USERS: '/api/dashboarduser/',
  SUPERADMIN_DASHBOARD: '/api/superadmin_dashboard/',
  userDetail: (id) => `/api/users/${id}/`,
  allUserDetail: (id) => `/api/alluser/${id}/`,
  ADD_USERS: '/api/addusers/',
  updateUser: (id) => `/api/updateusers/${id}/`,
  deleteUser: (id) => `/api/deleteusers/${id}/`,
  updateUserRole: (id) => `/api/updateusers/${id}/role/`,
  // Projects (admin)
  PROJECTS_LIST: '/api/projectdashboard/',
  projectDetail: (id) => `/api/projectall/${id}/`,
  ADD_PROJECT: '/api/add_project/',
  updateProject: (id) => `/api/update_project/${id}/`,
  deleteProject: (id) => `/api/delete_project/${id}/`,
  UPLOAD: '/api/upload/',
}

export { API_BASE_URL }
