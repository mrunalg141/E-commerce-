import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!added) return undefined
    const timeoutId = window.setTimeout(() => setAdded(false), 1500)
    return () => window.clearTimeout(timeoutId)
  }, [added])

  const handleAddToCart = () => {
    addItem(product)
    setAdded(true)
  }

  const availability = product.stock < 10
    ? `Only ${product.stock} left`
    : `${product.stock} available`

  return <article className="product-card">
    <Link to={`/products/${product.id}`} className="product-image-wrap">
      <img src={product.image} alt={`${product.name} - ${product.category}`} loading="lazy" />
      <span className="product-tag">{product.category}</span>
    </Link>
    <div className="product-info">
      <div><Link to={`/products/${product.id}`} className="product-name">{product.name}</Link><p className={`availability${product.stock < 10 ? ' low-stock' : ''}`}>{product.stock > 0 ? availability : 'Sold out'}</p></div>
      <strong>${product.price}</strong>
    </div>
    <button type="button" className="text-button" onClick={handleAddToCart} disabled={!product.stock}>
      {product.stock === 0 ? 'Sold out' : added ? 'Added ✓' : 'Add to cart +'}
    </button>
  </article>
}
