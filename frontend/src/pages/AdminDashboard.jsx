import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import authAPI from '../api/auth'
import productsAPI from '../api/products'
import { toMediaUrl } from '../config/api'
import Loader from '../components/Loader'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [pendingProducts, setPendingProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('stats')
  const [users, setUsers] = useState([])
  const [editingUser, setEditingUser] = useState(null)
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: '',
    is_blocked: false
  })

  useEffect(() => {
    fetchData()
  }, [])

  // Helper function to get full image URL
  const getImageUrl = (image) => {
    return toMediaUrl(image, 'https://via.placeholder.com/100x75?text=No+Image')
  }

  const fetchData = async () => {
    try {
      const [statsData, productsData] = await Promise.all([
        authAPI.getAdminStats(),
        productsAPI.getPendingProducts()
      ])
      setStats(statsData)
      setPendingProducts(productsData)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const data = await authAPI.getUsers()
      setUsers(data)
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
  }

  const fetchAllProducts = async () => {
    try {
      const data = await productsAPI.getProducts()
      setAllProducts(data)
    } catch (err) {
      console.error('Failed to fetch products:', err)
    }
  }

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    } else if (activeTab === 'allProducts') {
      fetchAllProducts()
    }
  }, [activeTab])

  const handleApprove = async (productId) => {
    try {
      await productsAPI.approveProduct(productId)
      setPendingProducts(pendingProducts.filter(p => p.id !== productId))
      fetchData()
    } catch (err) {
      alert('Failed to approve product')
    }
  }

  const handleBlockUser = async (userId) => {
    try {
      await authAPI.blockUser(userId)
      fetchUsers()
    } catch (err) {
      alert('Failed to block/unblock user')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    
    try {
      await authAPI.deleteUser(userId)
      fetchUsers()
      alert('User deleted successfully')
    } catch (err) {
      alert('Failed to delete user')
    }
  }

  const handleEditUser = (user) => {
    setEditingUser(user.id)
    setEditFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      role: user.role,
      is_blocked: user.is_blocked
    })
  }

  const handleSaveUser = async () => {
    try {
      await authAPI.updateUser(editingUser, editFormData)
      setEditingUser(null)
      fetchUsers()
      alert('User updated successfully')
    } catch (err) {
      alert('Failed to update user')
    }
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
  }

  if (loading) return <Loader />

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user?.username}</p>
        </div>

        <div className="admin-tabs">
          <button 
            className={activeTab === 'stats' ? 'active' : ''} 
            onClick={() => setActiveTab('stats')}
          >
            Statistics
          </button>
          <button 
            className={activeTab === 'products' ? 'active' : ''} 
            onClick={() => setActiveTab('products')}
          >
            Pending Products ({pendingProducts.length})
          </button>
          <button 
            className={activeTab === 'allProducts' ? 'active' : ''} 
            onClick={() => setActiveTab('allProducts')}
          >
            All Products
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''} 
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </div>

        {activeTab === 'stats' && stats && (
          <div className="stats-section">
            <div className="stat-cards">
              <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-value">{stats.total_users}</p>
                <span className="stat-sub">+{stats.today_users} today</span>
              </div>
              <div className="stat-card">
                <h3>Total Products</h3>
                <p className="stat-value">{stats.total_products}</p>
                <span className="stat-sub">+{stats.today_products} today</span>
              </div>
              <div className="stat-card">
                <h3>Blocked Users</h3>
                <p className="stat-value">{stats.blocked_users}</p>
              </div>
            </div>

            <div className="stats-details">
              <div className="detail-card">
                <h3>Products by Status</h3>
                <div className="detail-item">
                  <span>Pending</span>
                  <span>{stats.products_by_status?.pending || 0}</span>
                </div>
                <div className="detail-item">
                  <span>Approved</span>
                  <span>{stats.products_by_status?.approved || 0}</span>
                </div>
                <div className="detail-item">
                  <span>Rejected</span>
                  <span>{stats.products_by_status?.rejected || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="products-section">
            <h2>Pending Products</h2>
            {pendingProducts.length === 0 ? (
              <p className="no-items">No pending products</p>
            ) : (
              <div className="products-list">
                {pendingProducts.map((product) => (
                  <div key={product.id} className="product-item">
                    <div className="product-image">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={getImageUrl(product.images[0])} 
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100x75?text=No+Image'
                          }}
                        />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p>{product.description?.substring(0, 100)}...</p>
                      <span className="product-price">KES {parseFloat(product.price).toLocaleString()}</span>
                    </div>
                    <div className="product-actions">
                      <button 
                        className="approve-btn"
                        onClick={() => handleApprove(product.id)}
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'allProducts' && (
          <div className="products-section">
            <h2>All Products</h2>
            {allProducts.length === 0 ? (
              <p className="no-items">No products found</p>
            ) : (
              <div className="products-list">
                {allProducts.map((product) => (
                  <div key={product.id} className="product-item">
                    <div className="product-image">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={getImageUrl(product.images[0])} 
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100x75?text=No+Image'
                          }}
                        />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p>{product.description?.substring(0, 100)}...</p>
                      <span className="product-price">KES {parseFloat(product.price).toLocaleString()}</span>
                      <span className={`status-badge ${product.status}`}>{product.status}</span>
                    </div>
                    <div className="product-actions">
                      {product.status === 'pending' && (
                        <button 
                          className="approve-btn"
                          onClick={() => handleApprove(product.id)}
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <h2>All Users</h2>
            {users.length === 0 ? (
              <p className="no-items">No users found</p>
            ) : (
              <div className="users-list">
                {users.map((u) => (
                  <div key={u.id} className="user-item">
                    {editingUser === u.id ? (
                      <div className="user-edit-form">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Username</label>
                            <input
                              type="text"
                              value={editFormData.username}
                              onChange={(e) => setEditFormData({...editFormData, username: e.target.value})}
                            />
                          </div>
                          <div className="form-group">
                            <label>Email</label>
                            <input
                              type="email"
                              value={editFormData.email}
                              onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>First Name</label>
                            <input
                              type="text"
                              value={editFormData.first_name}
                              onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})}
                            />
                          </div>
                          <div className="form-group">
                            <label>Last Name</label>
                            <input
                              type="text"
                              value={editFormData.last_name}
                              onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Role</label>
                            <select
                              value={editFormData.role}
                              onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                            >
                              <option value="customer">Customer</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                          <div className="form-group checkbox-group">
                            <label>
                              <input
                                type="checkbox"
                                checked={editFormData.is_blocked}
                                onChange={(e) => setEditFormData({...editFormData, is_blocked: e.target.checked})}
                              />
                              Blocked
                            </label>
                          </div>
                        </div>
                        <div className="form-actions">
                          <button className="save-btn" onClick={handleSaveUser}>Save</button>
                          <button className="cancel-btn" onClick={handleCancelEdit}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="user-info">
                          <h3>{u.username}</h3>
                          <p>{u.email}</p>
                          <p>{u.first_name} {u.last_name}</p>
                          <span className={`user-role ${u.role}`}>{u.role}</span>
                          {u.is_blocked && <span className="blocked-badge">Blocked</span>}
                        </div>
                        <div className="user-actions">
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditUser(u)}
                          >
                            Edit
                          </button>
                          <button 
                            className={u.is_blocked ? 'unblock-btn' : 'block-btn'}
                            onClick={() => handleBlockUser(u.id)}
                          >
                            {u.is_blocked ? 'Unblock' : 'Block'}
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteUser(u.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
