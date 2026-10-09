import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchProducts, PAGE_SIZE, type Product } from './lib/products'

export function useProducts(brands: string[]) {
  const [items, setItems] = useState<Product[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const inFlight = useRef(false)
  const offset = useRef(0)
  const request = useRef(0)
  const brandsKey = brands.join('|')
  const lastKey = useRef(brandsKey)

  const loadMore = useCallback(async () => {
    if (inFlight.current) return
    inFlight.current = true
    const id = request.current
    setLoading(true)
    setError(null)
    try {
      const page = await fetchProducts({ offset: offset.current, limit: PAGE_SIZE, brands })
      if (id !== request.current) return
      offset.current += page.items.length
      setItems((prev) => [...prev, ...page.items])
      setTotal(page.total)
    } catch (e) {
      if (id !== request.current) return
      setError(e instanceof Error ? e : new Error('Failed to load products'))
    } finally {
      if (id === request.current) {
        inFlight.current = false
        setLoading(false)
      }
    }
  }, [brands])

  // Filters changed: keep the current items on screen (faded out by the grid)
  // until the first page of the new selection replaces them.
  useEffect(() => {
    if (lastKey.current === brandsKey) return
    lastKey.current = brandsKey
    const id = ++request.current
    inFlight.current = true
    setRefreshing(true)
    setLoading(false)
    setError(null)
    fetchProducts({ offset: 0, limit: PAGE_SIZE, brands })
      .then((page) => {
        if (id !== request.current) return
        offset.current = page.items.length
        setItems(page.items)
        setTotal(page.total)
      })
      .catch((e) => {
        if (id !== request.current) return
        offset.current = 0
        setItems([])
        setError(e instanceof Error ? e : new Error('Failed to load products'))
      })
      .finally(() => {
        if (id !== request.current) return
        inFlight.current = false
        setRefreshing(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandsKey])

  const hasMore = total === null || items.length < total

  return { items, total, loading, refreshing, error, hasMore, loadMore }
}
