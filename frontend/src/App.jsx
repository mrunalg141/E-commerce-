import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Account from './pages/Account'
import './App.css'

export default function App() { return <BrowserRouter><CartProvider><Routes><Route element={<Layout />}><Route path="/" element={<Home />} /><Route path="/shop" element={<Shop />} /><Route path="/products/:id" element={<ProductDetails />} /><Route path="/cart" element={<Cart />} /><Route path="/account" element={<Account />} /><Route path="*" element={<Home />} /></Route></Routes></CartProvider></BrowserRouter> }
