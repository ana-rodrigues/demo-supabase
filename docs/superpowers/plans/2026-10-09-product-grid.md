# Product Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A minimal Apple/Teenage Engineering–style product grid page with infinite scroll (pages of 20), skeletons, and a swappable mock data layer.

**Architecture:** A single `fetchProducts({offset, limit})` function is the only data boundary (mock now, Supabase later). A `useProducts` hook owns paging state; `ProductGrid` renders cards/skeletons and an IntersectionObserver sentinel that calls `loadMore`. Styling is plain CSS with light tokens.

**Tech Stack:** Vite 8, React 19 (React Compiler enabled), TypeScript, plain CSS, Google Fonts (Inter, Geist Mono).

**Spec:** `docs/superpowers/specs/2026-10-09-product-grid-design.md`

## Global Constraints

- Grid `max-width: 1024px`, 3 columns, 24px gap; 2 columns ≤ 900px, 1 column ≤ 560px.
- `PAGE_SIZE = 20`; mock total = 50 (pages 20 / 20 / 10); counter shows the total (50).
- Placeholder product: id `544439`, brand `Teenage Engineering`, name `OP-1 field`, price `1655` `EUR`, image `https://thumbs.static-thomann.de/thumb/padthumb600x600/pics/bdb/_54/544439/17643235_800.jpg`. Ids must be unique per mock item.
- Background `#f5f5f7`; cards white, 20px radius, subtle shadow. Fonts: Inter + Geist Mono.
- Only the footer credit survives from the demo chrome. No git commits unless the user asks.

## Review Focus

- Sentinel stays in view after a page loads (tall viewport): next page must still load.
- Double trigger (StrictMode double effect, fast scroll): a page must never be fetched twice.
- Last page (10 items): no further fetch, no skeletons, sentinel removed.
- Fetch failure: inline message + Retry, no fetch loop.
- Reduced motion: shimmer and hover lift disabled.

---

### Task 1: Data layer and hook

**Files:**
- Create: `src/lib/products.ts`
- Create: `src/useProducts.ts`

**Interfaces:**
- Produces: `type Product`, `PAGE_SIZE`, `fetchProducts`, `useProducts`.

- [ ] **Step 1: Create `src/lib/products.ts`**

```ts
export type Product = {
  id: string
  brand: string
  name: string
  price: number
  currency: string
  imageUrl: string
}

export const PAGE_SIZE = 20

const MOCK_TOTAL = 50
const LATENCY_MS = 700

const PLACEHOLDER = {
  brand: 'Teenage Engineering',
  name: 'OP-1 field',
  price: 1655,
  currency: 'EUR',
  imageUrl:
    'https://thumbs.static-thomann.de/thumb/padthumb600x600/pics/bdb/_54/544439/17643235_800.jpg',
}

export type ProductPage = { items: Product[]; total: number }

// The only data boundary. To go live, replace the body with:
//   supabase.from('synthesizers').select('*', { count: 'exact' })
//     .range(offset, offset + limit - 1)
// then map rows (manufacturer, model, price, currency, image_url) to Product.
export async function fetchProducts({
  offset,
  limit,
}: {
  offset: number
  limit: number
}): Promise<ProductPage> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS))
  const end = Math.min(offset + limit, MOCK_TOTAL)
  const items: Product[] = []
  for (let i = offset; i < end; i++) {
    items.push({ id: `544439-${i}`, ...PLACEHOLDER })
  }
  return { items, total: MOCK_TOTAL }
}
```

- [ ] **Step 2: Create `src/useProducts.ts`**

```ts
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
```

- [ ] **Step 3: Type-check**

Run: `npx tsc -b`
Expected: no errors.

---

### Task 2: Card, skeleton and grid components

**Files:**
- Create: `src/components/ProductCard.tsx`
- Create: `src/components/ProductCardSkeleton.tsx`
- Create: `src/components/ProductGrid.tsx`

**Interfaces:**
- Consumes: `Product`, `PAGE_SIZE` from `../lib/products`; `useProducts` return shape.
- Produces: `<ProductGrid items total loading error hasMore onLoadMore />`.

- [ ] **Step 1: Create `src/components/ProductCard.tsx`**

```tsx
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
        <h2 className="card-name">{product.name}</h2>
        <p className="card-price">{price}</p>
      </div>
    </article>
  )
}
```

- [ ] **Step 2: Create `src/components/ProductCardSkeleton.tsx`**

```tsx
export function ProductCardSkeleton() {
  return (
    <div className="card card-skeleton" aria-hidden="true">
      <div className="card-media skeleton" />
      <div className="card-body">
        <span className="skeleton skeleton-line skeleton-brand" />
        <span className="skeleton skeleton-line skeleton-name" />
        <span className="skeleton skeleton-line skeleton-price" />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/ProductGrid.tsx`**

```tsx
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
```

- [ ] **Step 4: Type-check**

Run: `npx tsc -b`
Expected: no errors.

---

### Task 3: Page, fonts and styles

**Files:**
- Modify: `index.html` (fonts, title)
- Overwrite: `src/index.css`, `src/App.css`
- Overwrite: `src/App.tsx`
- Delete: `src/SegmentControl.tsx`

**Interfaces:**
- Consumes: `useProducts`, `ProductGrid`.

- [ ] **Step 1: Read `src/main.tsx` and `src/App.css`** to preserve anything the page still needs (e.g. Agentation mount stays untouched in `main.tsx`; footer styles move into the new `App.css`).

- [ ] **Step 2: Edit `index.html`**: set `<title>Products</title>` and add inside `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

- [ ] **Step 3: Overwrite `src/index.css`**

```css
*, *::before, *::after { box-sizing: border-box; }

:root {
  --bg: #f5f5f7;
  --card: #fff;
  --ink: #1d1d1f;
  --muted: rgba(29, 29, 31, 0.55);
  --tile: #fafafa;
  --line: rgba(0, 0, 0, 0.06);
  --radius-card: 20px;
  --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.06);
  --shadow-card-hover: 0 2px 4px rgba(0, 0, 0, 0.05), 0 16px 36px rgba(0, 0, 0, 0.1);
  --ease-ui: cubic-bezier(0.32, 0.72, 0, 1);
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, 'SF Mono', monospace;

  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  color-scheme: light;
  background: var(--bg);
  color: var(--ink);
}

body { margin: 0; min-height: 100vh; }
button { font: inherit; color: inherit; }
```

- [ ] **Step 4: Overwrite `src/App.css`**

```css
.page {
  max-width: 1024px;
  margin: 0 auto;
  padding: 72px 24px 48px;
}

.page-title {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 0 0 40px;
  font-size: clamp(48px, 8vw, 96px);
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 1;
}

.page-count {
  margin-top: 0.12em;
  font-family: var(--font-mono);
  font-size: clamp(13px, 1.4vw, 18px);
  font-weight: 500;
  letter-spacing: 0;
  color: var(--muted);
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.card {
  display: flex;
  flex-direction: column;
  background: var(--card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: transform 0.3s var(--ease-ui), box-shadow 0.3s var(--ease-ui);
}
.card:not(.card-skeleton):hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.card-media {
  aspect-ratio: 1;
  margin: 12px 12px 0;
  border-radius: 12px;
  background: var(--tile);
  display: grid;
  place-items: center;
  overflow: hidden;
}
.card-media img { width: 100%; height: 100%; object-fit: contain; }

.card-body { padding: 16px 20px 20px; display: flex; flex-direction: column; gap: 4px; }
.card-brand {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}
.card-name { margin: 0; font-size: 18px; font-weight: 500; letter-spacing: -0.01em; }
.card-price { margin: 8px 0 0; font-family: var(--font-mono); font-size: 14px; }

.skeleton {
  background: linear-gradient(90deg, #ececee 25%, #f6f6f8 50%, #ececee 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
}
.skeleton-line { display: block; height: 14px; border-radius: 6px; }
.skeleton-brand { width: 40%; height: 11px; }
.skeleton-name { width: 70%; height: 18px; margin-top: 4px; }
.skeleton-price { width: 25%; margin-top: 10px; }
@keyframes shimmer { to { background-position: -200% 0; } }

.sentinel { height: 1px; }

.grid-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
  color: var(--muted);
}
.grid-error button {
  padding: 8px 16px;
  border: 0;
  border-radius: 999px;
  background: var(--ink);
  color: #fff;
  cursor: pointer;
}

.page-footer { margin-top: 64px; text-align: center; font-size: 13px; color: var(--muted); }
.page-footer a { color: inherit; }

@media (max-width: 900px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 560px) {
  .page { padding: 48px 16px 32px; }
  .grid { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; }
  .card { transition: none; }
  .card:not(.card-skeleton):hover { transform: none; }
}
```

- [ ] **Step 5: Overwrite `src/App.tsx`**

```tsx
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
```

- [ ] **Step 6: Delete `src/SegmentControl.tsx`** and confirm nothing else imports it (`grep -rn SegmentControl src`).

- [ ] **Step 7: Verify build**

Run: `npx tsc -b && npm run lint && npm run build`
Expected: all pass.

---

### Task 4: Browser verification

- [ ] **Step 1:** Run `npm run dev`; open the page.
- [ ] **Step 2:** Check: heading with superscript counter `50` (shows `—` until first page lands); 20 skeletons first, then 20 cards in 3 columns at ≥ 901px, container ≤ 1024px.
- [ ] **Step 3:** Scroll: 40 cards, then 50 (last load shows 10 skeletons). After 50, no skeletons and no more requests. Tall viewport (zoom out) loads all pages without scrolling.
- [ ] **Step 4:** Resize: 2 columns ≤ 900px, 1 column ≤ 560px, no horizontal scroll.
- [ ] **Step 5:** Temporarily make `fetchProducts` throw; confirm inline error + Retry and no request loop; revert.
- [ ] **Step 6:** Enable reduced motion in dev tools; confirm no shimmer or hover lift.

---

## Self-Review

- Spec coverage: mock/total 50, paging 20, skeletons, error + Retry, fonts, layout, breakpoints, footer-only chrome, reduced motion, verification — all mapped to tasks 1–4.
- Names consistent: `fetchProducts`, `PAGE_SIZE`, `useProducts`, `onLoadMore`/`loadMore`, `Product` fields (`brand`, `name`, `price`, `currency`, `imageUrl`).
- No placeholders.
