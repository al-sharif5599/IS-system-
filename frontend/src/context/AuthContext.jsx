import { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import authAPI from '../api/auth'
import { API_BASE_URL } from '../config/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        const currentTime = Date.now() / 1000
        
        if (decoded.exp < currentTime) {
          await refreshToken()
        } else {
          const userData = await authAPI.getCurrentUser()
          setUser(userData)
        }
      } catch (err) {
        console.error('Auth check failed:', err)
        authAPI.logout()
      }
    }
    setLoading(false)
  }

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token')
      if (!refreshTokenValue) {
        authAPI.logout()
        setUser(null)
        return false
      }
      
      const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
        refresh: refreshTokenValue,
      })
      localStorage.setItem('access_token', response.data.access)
      
      try {
        const userData = await authAPI.getCurrentUser()
        setUser(userData)
        return true
      } catch (userErr) {
        console.error('Failed to fetch user data after token refresh:', userErr)
        authAPI.logout()
        setUser(null)
        return false
      }
    } catch (err) {
      console.error('Token refresh failed:', err)
      authAPI.logout()
      setUser(null)
      return false
    }
  }

  const login = async (credentials) => {
    setError(null)
    try {
      await authAPI.login(credentials)
      const userData = await authAPI.getCurrentUser()
      setUser(userData)
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.detail || 'Login failed'
      setError(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    setError(null)
    try {
      const response = await authAPI.register(userData)
      return { success: true, message: response.message }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed'
      setError(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    authAPI.logout()
    setUser(null)
  }

  const updateUser = async (data) => {
    try {
      const updatedUser = await authAPI.updateCurrentUser(data)
      setUser(updatedUser)
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || 'Update failed'
      return { success: false, error: message }
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || user?.role === 'admin',
    isCustomer: user?.role === 'customer',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
