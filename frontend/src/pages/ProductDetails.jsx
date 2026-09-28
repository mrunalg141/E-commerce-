import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { findProduct } from '../data/products'
import { useCart } from '../context/CartContext'

export default function ProductDetails() {
  const { id } = useParams(); const product = findProduct(id); const [quantity, setQuantity] = useState(1); const { addItem } = useCart()
  if (!product) return <div className="empty-state page"><h1>Piece not found.</h1><Link to="/shop" className="button button-dark">Back to shop</Link></div>
  return <div className="page detail-page"><Link to="/shop" className="back-link">← Back to collection</Link><div className="detail-layout"><div className="detail-image"><img src={product.image} alt={product.name} /></div><div className="detail-copy"><p className="eyebrow">{product.category} / Atelier edition</p><h1>{product.name}</h1><p className="detail-price">${product.price}</p><p className="detail-description">{product.description}</p><div className="detail-rule" /><div className="detail-meta"><span>Availability</span><strong>{product.stock > 0 ? `In stock / ${product.stock} available` : 'Out of stock'}</strong></div><div className="purchase-row"><div className="quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button><span>{quantity}</span><button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button></div><button className="button button-dark add-button" onClick={() => addItem(product, quantity)}>Add to cart <span>↗</span></button></div><p className="preview-note">Cart persistence is available locally while product and order APIs are being completed in the backend.</p></div></div></div>
}
