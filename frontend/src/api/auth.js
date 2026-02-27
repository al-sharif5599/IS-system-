import api, { extractList } from './axios'

export const authAPI = {
  // Login
  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials)
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)
    }
    return response.data
  },

  // Register
  register: async (userData) => {
    const payload = {
      ...userData,
      password_confirm: userData.password_confirm || userData.confirm_password,
    }
    const response = await api.post('/auth/register/', payload)
    return response.data
  },

  // Logout
  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },

  // Get Current User
  getCurrentUser: async () => {
    const response = await api.get('/auth/me/')
    return response.data
  },

  // Update Current User
  updateCurrentUser: async (data) => {
    const response = await api.patch('/auth/me/', data)
    return response.data
  },

  // Change Password
  changePassword: async (passwordData) => {
    const response = await api.post('/auth/change-password/', passwordData)
    return response.data
  },

  // Request Password Reset
  requestPasswordReset: async (email) => {
    const response = await api.post('/auth/password-reset/', { email })
    return response.data
  },

  // Confirm Password Reset
  confirmPasswordReset: async (uidb64, token, newPassword) => {
    const response = await api.post(`/auth/password-reset/confirm/${uidb64}/${token}/`, {
      new_password: newPassword,
      confirm_password: newPassword,
    })
    return response.data
  },

  // Get Admin Stats
  getAdminStats: async () => {
    const response = await api.get('/admin/stats/')
    return response.data
  },

  // Get All Users (Admin)
  getUsers: async () => {
    const response = await api.get('/admin/users/')
    return extractList(response.data)
  },

  // Update User (Admin)
  updateUser: async (userId, userData) => {
    const response = await api.patch(`/admin/users/${userId}/`, userData)
    return response.data
  },

  // Block/Unblock User (Admin)
  blockUser: async (userId) => {
    const response = await api.post(`/admin/users/${userId}/block/`)
    return response.data
  },

  // Delete User (Admin)
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}/`)
    return response.data
  },
}

export default authAPI
