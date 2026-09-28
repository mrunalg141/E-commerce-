import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  return <article className="product-card"><Link to={`/products/${product.id}`} className="product-image-wrap"><img src={product.image} alt={product.name} /><span className="product-tag">{product.category}</span></Link><div className="product-info"><div><Link to={`/products/${product.id}`} className="product-name">{product.name}</Link><p className="availability">{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</p></div><strong>${product.price}</strong></div><button className="text-button" onClick={() => addItem(product)} disabled={!product.stock}>Add to cart <span>+</span></button></article>
}
