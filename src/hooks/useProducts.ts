import { useState, useEffect } from 'react'
import { fetchProducts } from '../lib/supabase'
import { mockProducts } from '../data/products'
import type { Product } from '../types'

/**
 * Fetches products from Supabase.
 * Falls back to mock data when Supabase env vars are not set,
 * so the UI is always functional during development.
 */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    const hasCreds =
      import.meta.env.VITE_SUPABASE_URL &&
      import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!hasCreds) {
      // Dev mode — use mock data
      setProducts(mockProducts)
      setLoading(false)
      return
    }

    fetchProducts()
      .then((data) => {
        setProducts(data.length ? data : mockProducts)
      })
      .catch((err) => {
        console.error('[useProducts]', err)
        setError(err.message)
        setProducts(mockProducts) // graceful fallback
      })
      .finally(() => setLoading(false))
  }, [])

  return { products, loading, error }
}
