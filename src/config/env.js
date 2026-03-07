/**
 * Environment config for connecting to Django backend.
 * Vite only exposes variables prefixed with VITE_ to the client.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

/**
 * Full URL for an API path (e.g. '/api/users/login/').
 * If VITE_API_BASE_URL is set, prepends it; otherwise uses same origin.
 */
export function apiUrl(path) {
  const base = API_BASE_URL.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return base ? `${base}${p}` : p
}

export { API_BASE_URL }
