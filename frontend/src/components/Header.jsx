import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Header() {
  const { count } = useCart()
  return <header className="site-header"><Link to="/" className="brand"><span className="brand-mark">A</span><span>Atelier<br /><em>Commerce</em></span></Link><nav className="main-nav"><NavLink to="/shop">Shop</NavLink><NavLink to="/shop?category=Objects">Objects</NavLink><NavLink to="/shop?category=Textiles">Textiles</NavLink></nav><div className="header-actions"><NavLink to="/account" className="account-link">Account</NavLink><Link to="/cart" className="cart-link" aria-label="Cart">Cart <span>{count}</span></Link></div></header>
}
