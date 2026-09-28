import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Header() {
  const { count } = useCart()
  return <header className="site-header"><Link to="/" className="brand"><span className="brand-mark">A</span><span>Atelier<br /><em>Commerce</em></span></Link><nav className="main-nav" aria-label="Main navigation"><NavLink to="/shop">Shop</NavLink><NavLink to="/account">Account</NavLink><NavLink to="/cart" className="cart-link" aria-label={`Cart, ${count} items`}>Cart <span>{count}</span></NavLink></nav></header>
}
