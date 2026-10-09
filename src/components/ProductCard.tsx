import { useEffect, useRef, useState } from 'react'
import { FALLBACK_PRODUCT_URL, type Product } from '../lib/products'

type Props = { product: Product; exiting?: boolean }

export function ProductCard({ product, exiting = false }: Props) {
  const [loaded, setLoaded] = useState(exiting)
  const img = useRef<HTMLImageElement>(null)

  // Cached images can finish before React attaches onLoad.
  useEffect(() => {
    if (img.current?.complete) setLoaded(true)
  }, [])

  const price = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: product.currency,
    maximumFractionDigits: 0,
  }).format(product.price)

  return (
    <a
      className="card"
      data-id={product.id}
      tabIndex={exiting ? -1 : undefined}
      href={product.sourceUrl || FALLBACK_PRODUCT_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="card-media">
        <img
          ref={img}
          src={product.imageUrl}
          alt={`${product.brand} ${product.name}`}
          loading="lazy"
          data-loaded={loaded}
          onLoad={() => setLoaded(true)}
        />
      </div>
      <div className="card-body">
        <p className="card-brand">{product.brand}</p>
        <div className="card-row">
          <h2 className="card-name">{product.name}</h2>
          <p className="card-price">{price}</p>
        </div>
      </div>
    </a>
  )
}
