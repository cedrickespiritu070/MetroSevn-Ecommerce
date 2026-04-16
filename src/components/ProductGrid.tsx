import type { Product } from '../types'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
}

function SkeletonCard() {
  return (
    <div className="flex flex-col bg-ms-cream border border-ms-gray-light overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-ms-gray-light" />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between gap-4">
          <div className="h-4 bg-ms-gray-light rounded w-3/4" />
          <div className="h-4 bg-ms-gray-light rounded w-1/5" />
        </div>
        <div className="flex gap-1.5 mt-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-9 h-9 bg-ms-gray-light" />
          ))}
        </div>
        <div className="h-10 bg-ms-gray-light mt-auto" />
      </div>
    </div>
  )
}

export default function ProductGrid({ products, loading = false }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-ms-gray-light">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-ms-gray">
          No products found
        </p>
      </div>
    )
  }

  return (
    /**
     * 1px gap on a dark background creates a grid-line effect
     * without visible borders — a clean high-end e-commerce pattern.
     */
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-ms-gray-light">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
