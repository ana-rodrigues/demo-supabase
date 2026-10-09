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
