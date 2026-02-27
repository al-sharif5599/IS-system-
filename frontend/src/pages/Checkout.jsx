import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import ordersAPI from '../api/orders'
import './Checkout.css'

const Checkout = () => {
  const { cart, clearCart } = useCart()
  const navigate = useNavigate()
  
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Create order
      const orderResponse = await ordersAPI.checkout(phoneNumber)
      const order = orderResponse.order
      
      // Initiate payment
      const paymentResponse = await ordersAPI.initiatePayment(
        order.id,
        phoneNumber,
        order.total_amount
      )

      // Clear cart and redirect to success
      await clearCart()
      
      alert('Order placed successfully! Check your email for confirmation.')
      navigate('/profile')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Checkout failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <h2>Your cart is empty</h2>
          <p>Add some products before checking out.</p>
          <button onClick={() => navigate('/')}>Continue Shopping</button>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Checkout</h1>
        
        <div className="checkout-content">
          <div className="checkout-form-section">
            <h2>Payment Details</h2>
            
            <form className="checkout-form" onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number (M-Pesa)</label>
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="254700000000"
                  required
                />
                <small>Enter your M-Pesa registered phone number</small>
              </div>
              
              <div className="payment-info">
                <h3>How it works:</h3>
                <ol>
                  <li>Enter your M-Pesa phone number</li>
                  <li>Click "Place Order"</li>
                  <li>You will receive an M-Pesa prompt on your phone</li>
                  <li>Enter your M-Pesa PIN to complete payment</li>
                </ol>
              </div>
              
              <button type="submit" className="place-order-btn" disabled={loading}>
                {loading ? 'Processing...' : `Place Order - KES ${parseFloat(cart.total || 0).toLocaleString()}`}
              </button>
            </form>
          </div>
          
          <div className="order-summary-section">
            <h2>Order Summary</h2>
            
            <div className="order-items">
              {cart.items.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="item-info">
                    <span className="item-name">{item.product?.name}</span>
                    <span className="item-qty">x{item.quantity}</span>
                  </div>
                  <span className="item-price">KES {parseFloat(item.subtotal || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
            
            <div className="order-total">
              <span>Total</span>
              <span>KES {parseFloat(cart.total || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
