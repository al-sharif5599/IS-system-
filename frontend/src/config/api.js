const getApiBaseUrl = () => {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim()
  if (!raw) return '/api'
  return raw.replace(/\/+$/, '')
}

export const API_BASE_URL = getApiBaseUrl()

const getBackendOrigin = () => {
  const explicit = import.meta.env.VITE_BACKEND_ORIGIN?.trim()
  if (explicit) return explicit.replace(/\/+$/, '')

  if (API_BASE_URL.startsWith('http://') || API_BASE_URL.startsWith('https://')) {
    try {
      return new URL(API_BASE_URL).origin
    } catch {
      return 'http://localhost:8000'
    }
  }

  return 'http://localhost:8000'
}

export const BACKEND_ORIGIN = getBackendOrigin()

export const toMediaUrl = (path, fallback = '') => {
  if (!path || typeof path !== 'string') return fallback
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/media/')) return `${BACKEND_ORIGIN}${path}`
  return `${BACKEND_ORIGIN}/media/${path.replace(/^\/+/, '')}`
}
