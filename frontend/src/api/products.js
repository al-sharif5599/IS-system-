import api, { extractList } from './axios'

export const productsAPI = {
  // Get all products
  getProducts: async (params = {}) => {
    const response = await api.get('/products/', { params })
    return extractList(response.data)
  },

  // Get single product
  getProduct: async (id) => {
    const response = await api.get(`/products/${id}/`)
    return response.data
  },

  // Search products
  searchProducts: async (searchTerm, category = null) => {
    const params = { search: searchTerm }
    if (category) params.category = category
    const response = await api.get('/products/search/', { params })
    return extractList(response.data)
  },

  // Get user's products
  getMyProducts: async () => {
    const response = await api.get('/products/my/')
    return extractList(response.data)
  },

  // Create product
  createProduct: async (productData) => {
    const formData = productData instanceof FormData ? productData : new FormData()

    if (!(productData instanceof FormData)) {
      Object.keys(productData).forEach((key) => {
        if (key === 'images') {
          productData.images.forEach((image) => {
            formData.append('images', image)
          })
        } else if (key === 'videos') {
          productData.videos.forEach((video) => {
            formData.append('videos', video)
          })
        } else {
          formData.append(key, productData[key])
        }
      })
    }

    const response = await api.post('/products/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  // Update product
  updateProduct: async (id, productData) => {
    const response = await api.patch(`/products/${id}/`, productData)
    return response.data
  },

  // Delete product
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}/`)
    return response.data
  },

  // Get pending products (Admin)
  getPendingProducts: async () => {
    const response = await api.get('/products/pending/')
    return extractList(response.data)
  },

  // Approve product (Admin)
  approveProduct: async (productId) => {
    const response = await api.post(`/products/${productId}/approve/`)
    return response.data
  },

  // Reject product (Admin)
  rejectProduct: async (productId, rejectionReason) => {
    const response = await api.post(`/products/${productId}/reject/`, {
      rejection_reason: rejectionReason
    })
    return response.data
  },

  // Get all categories
  getCategories: async () => {
    const response = await api.get('/categories/')
    return extractList(response.data)
  },

  // Create category (Admin)
  createCategory: async (categoryData) => {
    const response = await api.post('/categories/', categoryData)
    return response.data
  },

  // Update category (Admin)
  updateCategory: async (id, categoryData) => {
    const response = await api.patch(`/categories/${id}/`, categoryData)
    return response.data
  },

  // Delete category (Admin)
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}/`)
    return response.data
  },
}

export default productsAPI
