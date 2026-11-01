import { supabase } from './supabase'

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

export type ProductPage = { items: Product[]; total: number }

export type Brand = { name: string; count: number }

// Raw Supabase `Produtos` row; any column may be null.
export type ProductRow = {
  product_id?: number | null
  manufacturer?: string | null
  model?: string | null
  price?: number | null
  currency?: string | null
  image_url?: string | null
  product_url?: string | null
}

// Maps a Supabase row to a Product.
export function toProduct(row: ProductRow, index = 0): Product {
  return {
    id: row.product_id != null ? String(row.product_id) : `row-${index}`,
    brand: row.manufacturer?.trim() ?? '',
    name: row.model?.trim() ?? '',
    price: row.price ?? 0,
    currency: row.currency?.trim() || 'EUR',
    imageUrl: row.image_url?.trim() ?? '',
    sourceUrl: row.product_url?.trim() || FALLBACK_PRODUCT_URL,
  }
}

export async function fetchProducts({
  offset,
  limit,
  brands = [],
}: {
  offset: number
  limit: number
  brands?: string[]
}): Promise<ProductPage> {
  let query = supabase.from('Produtos').select('*', { count: 'exact' })
  if (brands.length > 0) query = query.in('manufacturer', brands)
  const { data, count, error } = await query
    .order('product_id', { ascending: true })
    .range(offset, offset + limit - 1)
  if (error) throw new Error(error.message)
  return {
    items: (data ?? []).map((row, i) => toProduct(row, offset + i)),
    total: count ?? 0,
  }
}

export async function fetchBrands(): Promise<Brand[]> {
  const { data, error } = await supabase.from('Produtos').select('manufacturer')
  if (error) throw new Error(error.message)
  const counts = new Map<string, number>()
  for (const { manufacturer } of data ?? []) {
    const name = manufacturer?.trim()
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name))
}
