# Product Grid — Design

## Outcome
A minimal, Apple / Teenage Engineering–inspired storefront page: a "Products" heading with a small total counter and a grid of product cards. Data is mocked now and swappable for Supabase later without touching the UI.

## Decisions (agreed)
- Mock "database": 50 identical items (product `544439`, Teenage Engineering OP-1 field, from `data/synthesizers.csv`) with unique ids. Counter shows **50**.
- Pagination: infinite scroll, `PAGE_SIZE = 20` (pages of 20 / 20 / 10), skeleton cards while loading.
- Card: image, brand, model name, price (Geist Mono).
- Page replaces the demo stage (dark theme, avatar header, Before/After switcher removed). Footer credit is kept.
- Fonts: Inter (UI) + Geist Mono (counter, brand, price), via Google Fonts in `index.html`.

## Layout & visuals
- Background light gray `#f5f5f7`; cards white, 20px radius, subtle layered shadow, slight lift on hover.
- Grid: `max-width: 1024px`, centered, 3 columns, 24px gap; 2 columns ≤ 900px, 1 column ≤ 560px.
- Heading "Products": large, tight tracking; counter is a small Geist Mono number top-aligned like a superscript.
- Card image: square tile, `object-fit: contain`, lazy-loaded. Brand: small, muted, uppercase Geist Mono. Name: Inter medium. Price: Geist Mono, formatted with `Intl.NumberFormat`.
- Skeleton mirrors the card layout with a soft shimmer; disabled under `prefers-reduced-motion`.

## Architecture
- `src/lib/products.ts`: `Product` type and `fetchProducts({ offset, limit }) → Promise<{ items, total }>`. Mock implementation with a short delay. Supabase swap = replace body with `.select('*', { count: 'exact' }).range(offset, offset + limit - 1)` plus a row-to-`Product` mapping.
- `src/useProducts.ts`: `{ items, total, loading, hasMore, loadMore }`; guards against concurrent loads and double-fetch; surfaces errors.
- `src/components/ProductCard.tsx`, `ProductCardSkeleton.tsx`, `ProductGrid.tsx` (grid + `IntersectionObserver` sentinel).
- `App.tsx`: heading + counter, grid, footer. `index.css` / `App.css`: light tokens replace dark ones.

## Error handling
Failed fetch shows an inline message with a "Retry" button below the grid; the sentinel does not re-fire while in error.

## Verification
`tsc -b`, `eslint`, `vite build`; browser check of layout, skeletons, scroll 20 → 40 → 50, no further loads at the end, and responsive breakpoints.

## Out of scope
Real Supabase client, filtering/sorting, product links, cart.
