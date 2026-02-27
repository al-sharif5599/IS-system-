import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import productsAPI from '../api/products'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import './Home.css'

const Home = () => {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, searchTerm])

  const fetchCategories = async () => {
    try {
      const data = await productsAPI.getCategories()
      setCategories(data)
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (selectedCategory) {
        params.category = selectedCategory
      }
      if (searchTerm) {
        params.search = searchTerm
      }
      const data = await productsAPI.getProducts(params)
      setProducts(data)
    } catch (err) {
      setError('Failed to load products')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchProducts()
  }

  return (
    <div className="home">
      <div className="home-hero">
        <h1>Welcome to OnlineShop</h1>
        <p>Discover amazing products at great prices</p>
      </div>

      <div className="home-container">
        <aside className="filters-sidebar">
          <h3>Categories</h3>
          <div className="category-list">
            <button
              className={`category-btn ${!selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory('')}
            >
              All Products
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </aside>

        <main className="products-main">
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>

          {loading ? (
            <Loader />
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <p>No products found</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Home
