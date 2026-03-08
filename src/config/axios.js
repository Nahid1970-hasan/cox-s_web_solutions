import axios from 'axios'
import { API_BASE_URL } from './env'

/**
 * Axios instance for backend API. Base URL from env; auth token added per request.
 */
const coreAxios = axios.create({
  baseURL: API_BASE_URL.replace(/\/$/, ''),
  headers: { 'Content-Type': 'application/json' },
})

coreAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export { coreAxios }
