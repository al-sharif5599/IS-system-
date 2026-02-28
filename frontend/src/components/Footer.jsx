import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">OnlineShop</h3>
          <p className="footer-text">
            Your one-stop shop for quality products at great prices.
          </p>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Quick Links</h4>
          <Link to="/" className="footer-link">Home</Link>
          <Link to="/cart" className="footer-link">Cart</Link>
          <Link to="/login" className="footer-link">Login</Link>
          <Link to="/register" className="footer-link">Register</Link>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Categories</h4>
          <Link to="/?category=electronics" className="footer-link">Electronics</Link>
          <Link to="/?category=clothing" className="footer-link">Clothing</Link>
          <Link to="/?category=home" className="footer-link">Home & Garden</Link>
          <Link to="/?category=sports" className="footer-link">Sports</Link>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Contact</h4>
          <p className="footer-text">Email: sharifmake5599@gmail.com</p>
          <p className="footer-text">Phone: +255 694019384</p>
          <p className="footer-text">Tanzania, Zanzibar</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} OnlineShop. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
