import { Link } from 'react-router-dom'
import { toMediaUrl } from '../config/api'
import './ProductCard.css'

const ProductCard = ({ product }) => {
  const getImageUrl = (image) => {
    return toMediaUrl(image, 'https://via.placeholder.com/300x200?text=No+Image')
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
          <span className="view-more">View Details</span>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
