import api from './axios'

export const cartAPI = {
  // Get user's cart
  getCart: async () => {
    const response = await api.get('/cart/')
    return response.data
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    const response = await api.post('/cart/add/', {
      product_id: productId,
      quantity,
    })
    return response.data
  },

  // Update cart item quantity
  updateCartItem: async (itemId, quantity) => {
    const response = await api.patch(`/cart/items/${itemId}/`, { quantity })
    return response.data
  },

  // Remove item from cart
  removeCartItem: async (itemId) => {
    const response = await api.delete(`/cart/items/${itemId}/delete/`)
    return response.data
  },

  // Clear cart
  clearCart: async () => {
    const response = await api.delete('/cart/clear/')
    return response.data
  },
}

export default cartAPI
