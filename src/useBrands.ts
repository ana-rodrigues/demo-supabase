import { useEffect, useState } from 'react'
import { fetchBrands, type Brand } from './lib/products'

// null while loading
export function useBrands() {
  const [brands, setBrands] = useState<Brand[] | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchBrands().then((result) => {
      if (!cancelled) setBrands(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return brands
}
