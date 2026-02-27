import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import './ProductCard.css'

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      alert('Please login to add items to cart')
      return
    }
    await addToCart(product.id, 1)
  }

  const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/300x200?text=No+Image'
    // If the image already has a full URL, use it as is
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image
    }
    // If it starts with /media/, prepend the backend URL
    if (image.startsWith('/media/')) {
      return `http://localhost:8000${image}`
    }
    // Otherwise, assume it's a relative path and prepend /media/
    return `http://localhost:8000/media/${image}`
  }

  const imageUrl = product.images && product.images.length > 0 
    ? getImageUrl(product.images[0]) 
    : 'https://via.placeholder.com/300x200?text=No+Image'

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-image">
        <img 
          src={imageUrl} 
          alt={product.name}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'
          }}
        />
        {product.status === 'pending' && (
          <span className="product-badge pending">Pending</span>
        )}
        {product.status === 'rejected' && (
          <span className="product-badge rejected">Rejected</span>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description?.substring(0, 80)}...</p>
        
        <div className="product-footer">
          <span className="product-price">KES {parseFloat(product.price).toLocaleString()}</span>
          <button 
            className="add-to-cart-btn"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
