import type { ReactNode } from 'react'
import { useProducts } from '../useProducts'
import { useScrolled } from '../useScrolled'
import { ProductGrid } from './ProductGrid'

type Props = { brands: string[]; aside: ReactNode }

export function Catalog({ brands, aside }: Props) {
  const { items, total, loading, refreshing, error, hasMore, loadMore } = useProducts(brands)
  const scrolled = useScrolled()

  return (
    <div className="layout">
      {aside}
      <div className="results">
        <h1 className="page-title" data-hidden={scrolled}>
          Products
          <sup className="page-count">{total ?? '—'}</sup>
        </h1>
        <ProductGrid
          items={items}
          total={total}
          loading={loading}
          refreshing={refreshing}
          error={error}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </div>
    </div>
  )
}
