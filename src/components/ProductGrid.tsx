import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { PAGE_SIZE, type Product } from '../lib/products'
import { ProductCard } from './ProductCard'
import { ProductCardSkeleton } from './ProductCardSkeleton'

type Rect = { left: number; top: number; width: number; height: number }
type Leaving = { product: Product; rect: Rect }

function Ghost({ product, rect, onDone }: Leaving & { onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const anim = ref.current?.animate(
      [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(0.97)' }],
      { duration: 150, easing: 'ease-out', fill: 'forwards' },
    )
    anim?.finished.then(onDone, () => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div ref={ref} className="card-ghost" aria-hidden="true" style={rect}>
      <ProductCard product={product} exiting />
    </div>
  )
}

const MOVE_EASING = 'cubic-bezier(0.23, 1, 0.32, 1)'
const STAGGER = 18
const MAX_STAGGER = 200
const EXIT_LEAD = 40
const ENTER_LEAD = 100
// Plain loads (first page, infinite scroll) have nothing leaving, so they get a calmer wave.
const LOAD_STAGGER = 30
const LOAD_MAX_STAGGER = 320
const LOAD_MS = 420
const MIN_MS = 280
const MAX_MS = 520

type Props = {
  items: Product[]
  total: number | null
  loading: boolean
  refreshing: boolean
  error: Error | null
  hasMore: boolean
  onLoadMore: () => void
}

export function ProductGrid({ items, total, loading, refreshing, error, hasMore, onLoadMore }: Props) {
  const sentinel = useRef<HTMLDivElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const rects = useRef(new Map<string, Rect>())
  const shown = useRef(new Map<string, Product>())
  const [leaving, setLeaving] = useState<Leaving[]>([])

  // Layout positions (offset*) ignore transforms, so mid-flight cards measure true.
  const measure = () => {
    const map = new Map<string, Rect>()
    grid.current?.querySelectorAll<HTMLElement>(':scope > [data-id]').forEach((el) => {
      map.set(el.dataset.id!, {
        left: el.offsetLeft,
        top: el.offsetTop,
        width: el.offsetWidth,
        height: el.offsetHeight,
      })
    })
    return map
  }

  // FLIP wave: survivors glide from their old slot to the new one, new cards
  // rise in, and everything is staggered in reading order so the grid settles
  // top-left to bottom-right instead of all at once. Leaving cards fade in a ghost.
  useLayoutEffect(() => {
    const next = measure()
    const before = rects.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const gone: Leaving[] = []
    if (!reduce) {
      before.forEach((rect, id) => {
        const product = shown.current.get(id)
        if (!next.has(id) && product) gone.push({ product, rect })
      })
      setLeaving(gone)

      const els = Array.from(grid.current?.querySelectorAll<HTMLElement>(':scope > [data-id]') ?? [])
      const moves = els
        .map((el) => {
          const from = before.get(el.dataset.id!)
          const dx = from ? from.left - el.offsetLeft : 0
          const dy = from ? from.top - el.offsetTop : 0
          return { el, entering: !from, dx, dy, top: el.offsetTop, left: el.offsetLeft }
        })
        .filter((m) => m.entering || Math.abs(m.dx) >= 1 || Math.abs(m.dy) >= 1)
        .sort((a, b) => a.top - b.top || a.left - b.left)

      // Survivors wait for the ghosts to start fading so they don't slide into
      // them; new cards wait a little longer so they land on mostly-cleared slots.
      moves.forEach(({ el, entering, dx, dy }, rank) => {
        el.getAnimations().forEach((a) => a.cancel())
        const lead = gone.length ? (entering ? ENTER_LEAD : EXIT_LEAD) : 0
        const load = entering && !gone.length
        const delay = lead + (load
          ? Math.min(rank * LOAD_STAGGER, LOAD_MAX_STAGGER)
          : Math.min(rank * STAGGER, MAX_STAGGER))
        if (entering) {
          el.animate(
            [
              { opacity: 0, transform: 'translateY(8px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: load ? LOAD_MS : 280, delay, easing: MOVE_EASING, fill: 'backwards' },
          )
        } else {
          const distance = Math.hypot(dx, dy)
          el.animate(
            [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
            {
              duration: Math.min(MIN_MS + distance * 0.25, MAX_MS),
              delay,
              easing: MOVE_EASING,
              fill: 'backwards',
            },
          )
        }
      })
    } else {
      setLeaving([])
    }

    rects.current = next
    shown.current = new Map(items.map((p) => [p.id, p]))
  }, [items])

  useEffect(() => {
    const node = grid.current
    if (!node) return
    const observer = new ResizeObserver(() => {
      rects.current = measure()
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Re-created whenever items/loading change, so a sentinel that is still
  // in view after a page lands triggers the next load.
  useEffect(() => {
    const node = sentinel.current
    if (!node || !hasMore || loading || refreshing || error) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore()
      },
      { rootMargin: '400px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [items.length, hasMore, loading, refreshing, error, onLoadMore])

  const skeletonCount = loading
    ? Math.min(PAGE_SIZE, total === null ? PAGE_SIZE : total - items.length)
    : 0

  return (
    <>
      <div ref={grid} className="grid" aria-busy={loading || refreshing} data-refreshing={refreshing}>
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {leaving.map(({ product, rect }) => (
          <Ghost
            key={`g-${product.id}`}
            product={product}
            rect={rect}
            onDone={() => setLeaving((l) => l.filter((g) => g.product.id !== product.id))}
          />
        ))}
        {Array.from({ length: skeletonCount }, (_, i) => (
          <ProductCardSkeleton key={`s-${i}`} />
        ))}
      </div>
      {!loading && !refreshing && !error && total === 0 && (
        <p className="grid-empty">No products match these filters.</p>
      )}
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
