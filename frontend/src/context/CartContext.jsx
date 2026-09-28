import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('atelier-cart') || '[]'))
  useEffect(() => localStorage.setItem('atelier-cart', JSON.stringify(items)), [items])
  const addItem = (product, quantity = 1) => setItems((current) => { const existing = current.find((item) => item.id === product.id); if (existing) return current.map((item) => item.id === product.id ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) } : item); return [...current, { ...product, quantity }] })
  const updateQuantity = (id, quantity) => setItems((current) => current.map((item) => item.id === id ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item))
  const removeItem = (id) => setItems((current) => current.filter((item) => item.id !== id))
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const value = useMemo(() => ({ items, addItem, updateQuantity, removeItem, subtotal, count: items.reduce((sum, item) => sum + item.quantity, 0) }), [items, subtotal])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
export const useCart = () => useContext(CartContext)
