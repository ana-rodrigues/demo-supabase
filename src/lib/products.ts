export type Product = {
  id: string
  brand: string
  name: string
  price: number
  currency: string
  imageUrl: string
  // Card link target (Supabase `source_url`); falls back to FALLBACK_PRODUCT_URL.
  sourceUrl?: string | null
}

export const PAGE_SIZE = 20

// Product page of the sample product (544439), used when a row has no source_url.
export const FALLBACK_PRODUCT_URL =
  'https://www.thomann.pt/teenage_engineering_op_1_field.htm?type=category'

const MOCK_TOTAL = 50
const LATENCY_MS = 250

const PLACEHOLDER = {
  brand: 'Teenage Engineering',
  name: 'OP-1 field',
  price: 1655,
  currency: 'EUR',
  imageUrl:
    'https://thumbs.static-thomann.de/thumb/padthumb600x600/pics/bdb/_54/544439/17643235_800.jpg',
}

export type ProductPage = { items: Product[]; total: number }

export type Brand = { name: string; count: number }

// Raw Supabase `synthesizers` row; any column may be null.
export type ProductRow = {
  id?: string | number | null
  manufacturer?: string | null
  model?: string | null
  price?: number | null
  currency?: string | null
  image_url?: string | null
  source_url?: string | null
}

// Maps a Supabase row to a Product, falling back to the sample product per field.
export function toProduct(row: ProductRow, index = 0): Product {
  return {
    id: row.id != null ? String(row.id) : `row-${index}`,
    brand: row.manufacturer?.trim() || PLACEHOLDER.brand,
    name: row.model?.trim() || PLACEHOLDER.name,
    price: typeof row.price === 'number' && Number.isFinite(row.price) ? row.price : PLACEHOLDER.price,
    currency: row.currency?.trim() || PLACEHOLDER.currency,
    imageUrl: row.image_url?.trim() || PLACEHOLDER.imageUrl,
    sourceUrl: row.source_url?.trim() || FALLBACK_PRODUCT_URL,
  }
}

// Temporary: Korg and Moog interleaved with the sample brand so filtering
// visibly rearranges cards.
const EXTRA_MOCK_BRANDS = [
  { brand: 'Korg', name: 'minilogue xd', price: 749 },
  { brand: 'Moog', name: 'Grandmother', price: 929 },
]

const MOCK_PRODUCTS: Product[] = Array.from({ length: MOCK_TOTAL }, (_, i) => {
  const extra = EXTRA_MOCK_BRANDS[i % 3 - 1]
  return { id: `544439-${i}`, ...PLACEHOLDER, ...extra }
})

// Data boundaries. To go live, replace the bodies with:
//   fetchProducts: supabase.from('synthesizers').select('*', { count: 'exact' })
//     [.in('manufacturer', brands) when brands is non-empty]
//     .range(offset, offset + limit - 1)
//   fetchBrands: distinct non-null manufacturer + count (view or rpc)
// then map rows with toProduct(row, offset + i).
export async function fetchProducts({
  offset,
  limit,
  brands = [],
}: {
  offset: number
  limit: number
  brands?: string[]
}): Promise<ProductPage> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS))
  const matching =
    brands.length === 0
      ? MOCK_PRODUCTS
      : MOCK_PRODUCTS.filter((p) => brands.includes(p.brand))
  return { items: matching.slice(offset, offset + limit), total: matching.length }
}

export async function fetchBrands(): Promise<Brand[]> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS / 2))
  const counts = new Map<string, number>()
  for (const p of MOCK_PRODUCTS) counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1)
  return [...counts].map(([name, count]) => ({ name, count }))
}
