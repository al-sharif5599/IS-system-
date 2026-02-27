import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import productsAPI from '../api/products'
import Loader from '../components/Loader'
import './AddProduct.css'

const AddProduct = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchingCategories, setFetchingCategories] = useState(true)
  const [previewImages, setPreviewImages] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    images: [],
    videos: [],
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const data = await productsAPI.getCategories()
      setCategories(data)
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    } finally {
      setFetchingCategories(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setFormData({ ...formData, images: [...formData.images, ...files] })
      
      // Create preview URLs
      const newPreviews = files.map(file => URL.createObjectURL(file))
      setPreviewImages([...previewImages, ...newPreviews])
    }
  }

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setFormData({ ...formData, videos: [...formData.videos, ...files] })
    }
  }

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    const newPreviews = previewImages.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
    setPreviewImages(newPreviews)
  }

  const removeVideo = (index) => {
    const newVideos = formData.videos.filter((_, i) => i !== index)
    setFormData({ ...formData, videos: newVideos })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const productData = new FormData()
      productData.append('name', formData.name)
      productData.append('description', formData.description)
      productData.append('price', formData.price)
      formData.images.forEach((image) => {
        productData.append('images', image)
      })
      
      formData.videos.forEach((video) => {
        productData.append('videos', video)
      })

      // Only append category if it's not empty
      if (formData.category) {
        productData.append('category', formData.category)
      }

      await productsAPI.createProduct(productData)
      alert('Product posted successfully! It will be reviewed by an admin.')
      navigate('/profile')
    } catch (err) {
      console.error('Failed to create product:', err)
      alert(err.response?.data?.message || 'Failed to create product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (fetchingCategories) return <Loader />

  return (
    <div className="add-product-page">
      <div className="add-product-container">
        <div className="add-product-header">
          <h1>Post a New Product</h1>
          <p>Fill in the details below to list your product</p>
        </div>

        <form className="add-product-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your product in detail"
              rows="5"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price (KES) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter price"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="images">Product Images *</label>
            <div className="file-input-container">
              <input
                type="file"
                id="images"
                onChange={handleImageChange}
                accept="image/*"
                multiple
              />
              <p className="file-hint">Upload multiple images (JPG, PNG, GIF)</p>
            </div>
            
            {previewImages.length > 0 && (
              <div className="image-previews">
                {previewImages.map((preview, index) => (
                  <div key={index} className="preview-item">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="videos">Product Videos</label>
            <div className="file-input-container">
              <input
                type="file"
                id="videos"
                onChange={handleVideoChange}
                accept="video/*"
                multiple
              />
              <p className="file-hint">Upload videos (MP4, WEBM)</p>
            </div>
            
            {formData.videos.length > 0 && (
              <div className="video-list">
                {formData.videos.map((video, index) => (
                  <div key={index} className="video-item">
                    <span>{video.name}</span>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeVideo(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <Loader /> : 'Post Product'}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>

          <p className="form-note">
            Note: Your product will be reviewed by an admin before it becomes visible to customers.
          </p>
        </form>
      </div>
    </div>
  )
}

export default AddProduct
