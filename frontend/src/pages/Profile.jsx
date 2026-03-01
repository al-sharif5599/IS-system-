import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import productsAPI from '../api/products'
import { toMediaUrl } from '../config/api'
import Loader from '../components/Loader'
import './Profile.css'

const Profile = () => {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('products')
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
  })

  useEffect(() => {
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
    return toMediaUrl(image, 'https://via.placeholder.com/200x150?text=No+Image')
  }

  const fetchMyProducts = async () => {
    try {
      const data = await productsAPI.getMyProducts()
      setProducts(data)
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setLoading(false)
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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getStatusColor = (status) => {
    if (status === 'approved') return 'success'
    if (status === 'pending') return 'warning'
    if (status === 'rejected') return 'danger'
    return ''
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
            <div className="profile-quick-actions">
              <button className="add-product-btn" onClick={() => navigate('/add-product')}>
                Post Product
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="profile-tabs">
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
