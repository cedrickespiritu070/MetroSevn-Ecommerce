// ── Supabase `products` table shape ──────────────────────────────────────────
export interface Product {
  id: string
  created_at: string
  name: string
  description: string
  price: number           // in PHP (e.g. 1200.00)
  image_url: string       // public URL from Supabase Storage
  category: 'hoodie' | 'tee' | 'cap' | 'bag' | 'accessories'
  stock: number
  sizes?: ProductSize[]
  tags?: string[]
}

export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'

// ── Cart ─────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: string           // product id
  name: string
  price: number
  image_url: string
  quantity: number
  size: ProductSize
}
