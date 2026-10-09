import type { Product } from '../lib/products'

export function ProductCard({ product }: { product: Product }) {
  const price = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: product.currency,
    maximumFractionDigits: 0,
  }).format(product.price)

  return (
    <article className="card">
      <div className="card-media">
        <img src={product.imageUrl} alt={`${product.brand} ${product.name}`} loading="lazy" />
      </div>
      <div className="card-body">
        <p className="card-brand">{product.brand}</p>
        <div className="card-row">
          <h2 className="card-name">{product.name}</h2>
          <p className="card-price">{price}</p>
        </div>
      </div>
    </article>
  )
}
