import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const ACCESS_TOKEN_KEY = 'talentsync_access_token'
const REFRESH_TOKEN_KEY = 'talentsync_refresh_token'

export const authStorage = {
  access: ACCESS_TOKEN_KEY,
  refresh: REFRESH_TOKEN_KEY,
}

export function getStoredToken(key) {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(key)
}

export function setStoredTokens({ access, refresh }) {
  if (typeof window === 'undefined') {
    return
  }

  if (access) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, access)
  }

  if (refresh) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  }
}

export function clearStoredTokens() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken(ACCESS_TOKEN_KEY)

    if (token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = getStoredToken(REFRESH_TOKEN_KEY)

      if (refreshToken) {
        try {
          const response = await axios.post(`${BASE_URL}/users/login/refresh/`, {
            refresh: refreshToken,
          })

          setStoredTokens({ access: response.data.access })
          api.defaults.headers.common.Authorization = `Bearer ${response.data.access}`
          originalRequest.headers = originalRequest.headers ?? {}
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`

          return api(originalRequest)
        } catch (refreshError) {
          clearStoredTokens()
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('talentsync-auth-logout'))
          }
          return Promise.reject(refreshError)
        }
      }

      clearStoredTokens()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('talentsync-auth-logout'))
      }
    }

    return Promise.reject(error)
  },
)

export default api