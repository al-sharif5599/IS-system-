import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { toMediaUrl } from '../config/api'
import Loader from '../components/Loader'
import './Cart.css'

const Cart = () => {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { cart, loading, updateQuantity, removeItem, clearCart, cartTotal } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [authLoading, isAuthenticated, navigate])

  // Helper function to get full image URL
  const getImageUrl = (image) => {
    return toMediaUrl(image, 'https://via.placeholder.com/150?text=No+Image')
  }

  // Get image for cart item with proper fallback
  const getCartItemImage = (item) => {
    const image = item?.product?.images?.[0]
    return getImageUrl(image)
  }

  if (authLoading || loading) {
    return <Loader />
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any items to your cart yet.</p>
          <Link to="/" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return
    await updateQuantity(itemId, newQuantity)
  }

  const handleRemoveItem = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      await removeItem(itemId)
    }
  }

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart()
    }
  }

  // Calculate total from items in case cart.total is not available
  const calculateTotal = () => {
    if (cart.items && cart.items.length > 0) {
      return cart.items.reduce((sum, item) => {
        const price = parseFloat(item.product?.price || 0)
        const quantity = parseInt(item.quantity || 1)
        return sum + (price * quantity)
      }, 0)
    }
    return 0
  }

  const total = cart.total ? parseFloat(cart.total) : calculateTotal()

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1>Shopping Cart</h1>
        
        <div className="cart-items">
          {cart.items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">
                <img 
                  src={getCartItemImage(item)} 
                  alt={item.product?.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150?text=No+Image'
                  }}
                />
              </div>
              
              <div className="cart-item-details">
                <Link to={`/product/${item.product?.id}`} className="item-name">
                  {item.product?.name}
                </Link>
                <p className="item-price">KES {parseFloat(item.product?.price || 0).toLocaleString()}</p>
              </div>
              
              <div className="cart-item-quantity">
                <button 
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              
              <div className="cart-item-subtotal">
                <p>KES {parseFloat(item.subtotal || 0).toLocaleString()}</p>
              </div>
              
              <button
                className="remove-btn"
                onClick={() => handleRemoveItem(item.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>KES {total.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>KES {total.toLocaleString()}</span>
          </div>
          
          <Link to="/checkout" className="checkout-btn">
            Proceed to Checkout
          </Link>
          
          <button className="clear-cart-btn" onClick={handleClearCart}>
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default Cart
