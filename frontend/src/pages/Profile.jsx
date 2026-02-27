import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import ordersAPI from '../api/orders'
import productsAPI from '../api/products'
import Loader from '../components/Loader'
import './Profile.css'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('orders')
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
  })

  useEffect(() => {
    fetchOrders()
    fetchMyProducts()
  }, [])

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
      })
    }
  }, [user])

  // Helper function to get full image URL
  const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/200x150?text=No+Image'
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image
    }
    if (image.startsWith('/media/')) {
      return `http://localhost:8000${image}`
    }
    return `http://localhost:8000/media/${image}`
  }

  const fetchOrders = async () => {
    try {
      const data = await ordersAPI.getOrders()
      setOrders(data)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyProducts = async () => {
    try {
      const data = await productsAPI.getMyProducts()
      setProducts(data)
    } catch (err) {
      console.error('Failed to fetch products:', err)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    await updateUser(profileData)
    setEditingProfile(false)
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    
    try {
      await productsAPI.deleteProduct(productId)
      setProducts(products.filter(p => p.id !== productId))
    } catch (err) {
      alert('Failed to delete product')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success'
      case 'pending': return 'warning'
      case 'cancelled': return 'danger'
      case 'approved': return 'success'
      case 'rejected': return 'danger'
      default: return ''
    }
  }

  if (loading) return <Loader />

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1>{user?.username}</h1>
            <p>{user?.email}</p>
            <span className="role-badge">{user?.role}</span>
          </div>
        </div>

        <div className="profile-tabs">
          <button 
            className={activeTab === 'orders' ? 'active' : ''} 
            onClick={() => setActiveTab('orders')}
          >
            My Orders
          </button>
          <button 
            className={activeTab === 'products' ? 'active' : ''} 
            onClick={() => setActiveTab('products')}
          >
            My Products
          </button>
          <button 
            className={activeTab === 'profile' ? 'active' : ''} 
            onClick={() => setActiveTab('profile')}
          >
            Profile Settings
          </button>
        </div>

        {activeTab === 'orders' && (
          <div className="orders-section">
            <h2>My Orders</h2>
            {orders.length === 0 ? (
              <p className="no-orders">No orders yet</p>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <span className="order-id">{order.order_id}</span>
                      <span className={`order-status ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="order-details">
                      <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                      <p>Items: {order.items?.length || 0}</p>
                      <p className="order-total">Total: KES {parseFloat(order.total_amount).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="products-section">
            <div className="section-header">
              <h2>My Products</h2>
              <button className="add-product-btn" onClick={() => navigate('/add-product')}>
                + Add New Product
              </button>
            </div>
            {products.length === 0 ? (
              <p className="no-products">No products posted yet. Click "Add New Product" to post your first product.</p>
            ) : (
              <div className="products-list">
                {products.map((product) => (
                  <div key={product.id} className="product-card">
                    <div className="product-image">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={getImageUrl(product.images[0])} 
                          alt={product.name} 
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/200x150?text=No+Image'
                          }}
                        />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="product-price">KES {parseFloat(product.price).toLocaleString()}</p>
                      <p className="product-description">{product.description?.substring(0, 100)}...</p>
                      <div className="product-meta">
                        <span className={`status-badge ${getStatusColor(product.status)}`}>
                          {product.status}
                        </span>
                        <span className="date-posted">
                          Posted: {new Date(product.date_posted).toLocaleDateString()}
                        </span>
                      </div>
                      {product.rejection_reason && (
                        <div className="rejection-reason">
                          <strong>Rejection Reason:</strong> {product.rejection_reason}
                        </div>
                      )}
                    </div>
                    <div className="product-actions">
                      {product.status === 'pending' && (
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="profile-section">
            <h2>Profile Settings</h2>
            
            {editingProfile ? (
              <form className="profile-form" onSubmit={handleProfileUpdate}>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone_number}
                    onChange={(e) => setProfileData({...profileData, phone_number: e.target.value})}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-btn">Save Changes</button>
                  <button type="button" className="cancel-btn" onClick={() => setEditingProfile(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-details">
                <div className="detail-row">
                  <span className="label">First Name</span>
                  <span className="value">{user?.first_name || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Last Name</span>
                  <span className="value">{user?.last_name || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Email</span>
                  <span className="value">{user?.email}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phone</span>
                  <span className="value">{user?.phone_number || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Role</span>
                  <span className="value">{user?.role}</span>
                </div>
                <button className="edit-btn" onClick={() => setEditingProfile(true)}>
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
