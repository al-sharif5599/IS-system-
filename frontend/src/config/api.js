const getApiBaseUrl = () => {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim()
  if (raw) return raw.replace(/\/+$/, '')

  const backendOrigin = import.meta.env.VITE_BACKEND_ORIGIN?.trim()
  if (backendOrigin) return `${backendOrigin.replace(/\/+$/, '')}/api`

  return '/api'
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

  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location
    if (hostname === 'localhost' || hostname === '127.0.0.1') return 'http://localhost:8000'
    return origin
  }

  return 'http://localhost:8000'
}

export const BACKEND_ORIGIN = getBackendOrigin()

export const toMediaUrl = (path, fallback = '') => {
  if (!path || typeof path !== 'string') return fallback
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/media/')) return `${BACKEND_ORIGIN}${path}`
  if (path.startsWith('media/')) return `${BACKEND_ORIGIN}/${path}`
  return `${BACKEND_ORIGIN}/media/${path.replace(/^\/+/, '')}`
}
