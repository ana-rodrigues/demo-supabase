import { useEffect, useRef } from 'react'
import { PAGE_SIZE, type Product } from '../lib/products'
import { ProductCard } from './ProductCard'
import { ProductCardSkeleton } from './ProductCardSkeleton'

type Props = {
  items: Product[]
  total: number | null
  loading: boolean
  error: Error | null
  hasMore: boolean
  onLoadMore: () => void
}

export function ProductGrid({ items, total, loading, error, hasMore, onLoadMore }: Props) {
  const sentinel = useRef<HTMLDivElement>(null)

  // Re-created whenever items/loading change, so a sentinel that is still
  // in view after a page lands triggers the next load.
  useEffect(() => {
    const node = sentinel.current
    if (!node || !hasMore || loading || error) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore()
      },
      { rootMargin: '400px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [items.length, hasMore, loading, error, onLoadMore])

  const skeletonCount = loading
    ? Math.min(PAGE_SIZE, total === null ? PAGE_SIZE : total - items.length)
    : 0

  return (
    <>
      <div className="grid" aria-busy={loading}>
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {Array.from({ length: skeletonCount }, (_, i) => (
          <ProductCardSkeleton key={`s-${i}`} />
        ))}
      </div>
      {error && (
        <div className="grid-error" role="alert">
          <span>Couldn’t load products.</span>
          <button type="button" onClick={onLoadMore}>
            Retry
          </button>
        </div>
      )}
      {hasMore && !error && <div ref={sentinel} className="sentinel" />}
    </>
  )
}
