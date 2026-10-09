import './App.css'
import { ProductGrid } from './components/ProductGrid'
import { useProducts } from './useProducts'

export default function App() {
  const { items, total, loading, error, hasMore, loadMore } = useProducts()

  return (
    <main className="page">
      <h1 className="page-title">
        Products
        <sup className="page-count">{total ?? '—'}</sup>
      </h1>
      <ProductGrid
        items={items}
        total={total}
        loading={loading}
        error={error}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
      <footer className="page-footer">
        AI prototyping for Designers by{' '}
        <a href="https://github.com/ana-rodrigues" target="_blank" rel="noopener noreferrer">
          Ana Rodrigues
        </a>
      </footer>
    </main>
  )
}
