import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import './Navbar.css'

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm)}`)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🛒</span>
          <span className="brand-text">OnlineShop</span>
        </Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            🔍
          </button>
        </form>

        <button 
          className="menu-toggle" 
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
            Home
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/add-product" className="nav-link" onClick={() => setMenuOpen(false)}>
                Post Product
              </Link>

              <Link to="/cart" className="nav-link cart-link" onClick={() => setMenuOpen(false)}>
                Cart
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>

              {isAdmin && (
                <Link to="/admin" className="nav-link admin-link" onClick={() => setMenuOpen(false)}>
                  Admin
                </Link>
              )}

              <Link to="/profile" className="nav-link" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>

              <button onClick={handleLogout} className="nav-link logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="nav-link btn-primary" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
