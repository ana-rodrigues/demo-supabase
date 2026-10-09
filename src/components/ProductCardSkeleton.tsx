export function ProductCardSkeleton() {
  return (
    <div className="card card-skeleton" aria-hidden="true">
      <div className="card-media skeleton" />
      <div className="card-body">
        <span className="skeleton skeleton-line skeleton-brand" />
        <div className="card-row">
          <span className="skeleton skeleton-line skeleton-name" />
          <span className="skeleton skeleton-line skeleton-price" />
        </div>
      </div>
    </div>
  )
}
