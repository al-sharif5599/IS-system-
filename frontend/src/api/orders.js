import api, { extractList } from './axios'

export const ordersAPI = {
  // Get all orders
  getOrders: async () => {
    const response = await api.get('/orders/')
    return extractList(response.data)
  },

  // Get single order
  getOrder: async (id) => {
    const response = await api.get(`/orders/${id}/`)
    return response.data
  },

  // Checkout - create order from cart
  checkout: async (phoneNumber) => {
    const response = await api.post('/orders/checkout/', {
      phone_number: phoneNumber,
    })
    return response.data
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    const response = await api.post(`/orders/${orderId}/cancel/`)
    return response.data
  },

  // Initiate payment
  initiatePayment: async (orderId, phoneNumber, amount) => {
    const response = await api.post('/payments/initiate/', {
      order_id: orderId,
      phone_number: phoneNumber,
      amount,
    })
    return response.data
  },

  // Get payments
  getPayments: async () => {
    const response = await api.get('/payments/')
    return extractList(response.data)
  },

  // Get payment details
  getPayment: async (id) => {
    const response = await api.get(`/payments/${id}/`)
    return response.data
  },
}

export default ordersAPI
