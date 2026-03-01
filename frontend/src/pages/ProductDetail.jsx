import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import productsAPI from '../api/products'
import { toMediaUrl } from '../config/api'
import Loader from '../components/Loader'
import './ProductDetail.css'

const ProductDetail = () => {
  const { id } = useParams()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const data = await productsAPI.getProduct(id)
      setProduct(data)
    } catch (err) {
      setError('Product not found')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get full image URL
  const getImageUrl = (image) => {
    return toMediaUrl(image, 'https://via.placeholder.com/600x400?text=No+Image')
  }

  // Helper function to get full video URL
  const getVideoUrl = (video) => {
    return toMediaUrl(video, '')
  }

  if (loading) return <Loader />
  if (error) return <div className="error">{error}</div>
  if (!product) return null

  const images = product.images && product.images.length > 0 
    ? product.images.map(getImageUrl) 
    : ['https://via.placeholder.com/600x400?text=No+Image']

  return (
    <div className="product-detail">
      <div className="product-detail-container">
        <div className="product-images">
          <div className="main-image">
            <img 
              src={images[selectedImage]} 
              alt={product.name}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x400?text=No+Image'
              }}
            />
          </div>
          {images.length > 1 && (
            <div className="thumbnail-list">
              {images.map((img, index) => (
                <button
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <span className="product-category">{product.category_name || 'Uncategorized'}</span>
          <h1 className="product-title">{product.name}</h1>
          <p className="product-price">KES {parseFloat(product.price).toLocaleString()}</p>
          
          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          {product.videos && product.videos.length > 0 && (
            <div className="product-videos">
              <h3>Videos</h3>
              {product.videos.map((video, index) => (
                <video key={index} controls>
                  <source src={getVideoUrl(video)} type="video/mp4" />
                </video>
              ))}
            </div>
          )}

          <div className="product-meta">
            <p>Posted: {new Date(product.date_posted).toLocaleDateString()}</p>
            <p>Status: <span className={`status ${product.status}`}>{product.status}</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
