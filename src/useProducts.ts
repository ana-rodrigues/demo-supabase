import { useCallback, useRef, useState } from 'react'
import { fetchProducts, PAGE_SIZE, type Product } from './lib/products'

export function useProducts() {
  const [items, setItems] = useState<Product[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const inFlight = useRef(false)
  const offset = useRef(0)

  const loadMore = useCallback(async () => {
    if (inFlight.current) return
    inFlight.current = true
    setLoading(true)
    setError(null)
    try {
      const page = await fetchProducts({ offset: offset.current, limit: PAGE_SIZE })
      offset.current += page.items.length
      setItems((prev) => [...prev, ...page.items])
      setTotal(page.total)
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load products'))
    } finally {
      inFlight.current = false
      setLoading(false)
    }
  }, [])

  const hasMore = total === null || items.length < total

  return { items, total, loading, error, hasMore, loadMore }
}
