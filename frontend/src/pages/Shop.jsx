import { useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import ProductCard from '../components/ProductCard'
import { categories, products } from '../data/products'

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [sort, setSort] = useState('featured')
  const selected = params.get('category') || 'All pieces'

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedQuery(query), 200)
    return () => window.clearTimeout(timeoutId)
  }, [query])

  const visible = useMemo(() => products
    .filter((product) => (selected === 'All pieces' || product.category === selected)
      && `${product.name} ${product.description}`.toLowerCase().includes(debouncedQuery.toLowerCase()))
    .sort((a, b) => sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : 0), [selected, debouncedQuery, sort])

  const clearFilters = () => {
    setQuery('')
    setDebouncedQuery('')
    setParams({})
  }

  return <div className="page shop-page">
    <div className="shop-intro">
      <div className="shop-heading">
        <p className="eyebrow">The collection</p>
        <h1>Objects for<br /><em>living well.</em></h1>
      </div>
      <p>Small-batch pieces, practical luxuries, and everyday essentials with a little soul.</p>
    </div>
    <div className="catalog-toolbar">
      <div className="filter-group">
        <div className="filter-tabs" aria-label="Filter products by category">
          {categories.map((category) => <button type="button" className={selected === category.name ? 'active' : ''} key={category.name} aria-pressed={selected === category.name} onClick={() => setParams(category.name === 'All pieces' ? {} : { category: category.name })}>{category.name}</button>)}
        </div>
        <span className="catalog-count" aria-live="polite">{visible.length} {visible.length === 1 ? 'piece' : 'pieces'}</span>
      </div>
      <div className="catalog-tools">
        <label className="search-field"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pieces" aria-label="Search products" /></label>
        <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select>
      </div>
    </div>
    {visible.length > 0 ? <div className="product-grid">{visible.map((product) => <ProductCard product={product} key={product.id} />)}</div> : <div className="empty-state"><h2>No pieces found.</h2><p>Try another search or collection.</p><button type="button" className="clear-filters" onClick={clearFilters}>Clear filters</button></div>}
  </div>
}
