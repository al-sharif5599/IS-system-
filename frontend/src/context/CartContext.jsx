import { createContext, useContext, useState, useEffect } from 'react'
import cartAPI from '../api/cart'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    } else {
      setCart(null)
    }
  }, [isAuthenticated])

  const fetchCart = async () => {
    setLoading(true)
    try {
      const data = await cartAPI.getCart()
      setCart(data)
    } catch (err) {
      console.error('Failed to fetch cart:', err)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId, quantity = 1) => {
    setError(null)
    try {
      await cartAPI.addToCart(productId, quantity)
      await fetchCart()
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to add to cart'
      setError(message)
      return { success: false, error: message }
    }
  }

  const updateQuantity = async (itemId, quantity) => {
    setError(null)
    try {
      await cartAPI.updateCartItem(itemId, quantity)
      await fetchCart()
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to update quantity'
      setError(message)
      return { success: false, error: message }
    }
  }

  const removeItem = async (itemId) => {
    setError(null)
    try {
      await cartAPI.removeCartItem(itemId)
      await fetchCart()
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to remove item'
      setError(message)
      return { success: false, error: message }
    }
  }

  const clearCart = async () => {
    setError(null)
    try {
      await cartAPI.clearCart()
      setCart(null)
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to clear cart'
      setError(message)
      return { success: false, error: message }
    }
  }

  const value = {
    cart,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart: fetchCart,
    cartItems: cart?.items || [],
    cartTotal: cart?.total ? parseFloat(cart.total) : 0,
    cartCount: cart?.items?.length || 0,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export default CartContext
