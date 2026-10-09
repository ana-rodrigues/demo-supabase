# Demo Supabase

A minimal, Apple / Teenage Engineering–inspired storefront page for browsing synthesizers. A "Products" heading with a live total counter, brand filtering, and an infinite-scrolling grid of product cards.

Data is mocked for now and designed to be swapped for [Supabase](https://supabase.com) later without touching the UI — see `src/lib/products.ts` for the seam.

## Stack

- **Vite 8** + **React 19** + **TypeScript**
- **agentation** — annotation tooling for the demo
- Fonts: Inter (UI) + Geist Mono (counter, brand, price)

## Getting started

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build    # type-check + production build
npm run lint     # eslint
npm run preview  # preview the production build
```

---

AI prototyping for Designers by [Ana Rodrigues](https://github.com/ana-rodrigues)
