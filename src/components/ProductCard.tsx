import { useState } from 'react'
import { ShoppingBag, Plus } from 'lucide-react'
import type { Product, ProductSize } from '../types'
import { useCartStore } from '../store/cartStore'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCartStore()
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null)
  const [added, setAdded] = useState(false)
  const [sizeError, setSizeError] = useState(false)

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true)
      setTimeout(() => setSizeError(false), 1200)
      return
    }
    addItem({
      id:        product.id,
      name:      product.name,
      price:     product.price,
      image_url: product.image_url,
      size:      selectedSize,
    })
    setAdded(true)
    setTimeout(() => { setAdded(false); openCart() }, 700)
  }

  const isFlagship = product.tags?.includes('flagship')

  return (
    <article className="group relative flex flex-col bg-ms-white border border-ms-gray-light overflow-hidden transition-shadow duration-300 hover:shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)]">

      {/* Image area */}
      <div className="relative overflow-hidden bg-ms-cream aspect-[3/4]">
        {/* Flagship badge */}
        {isFlagship && (
          <span className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-ms-blue text-ms-white text-[9px] font-mono uppercase tracking-widest">
            New Arrival
          </span>
        )}

        {/* Product image */}
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
          loading="lazy"
          onError={(e) => {
            // Fallback placeholder when image isn't uploaded yet
            const t = e.currentTarget
            t.style.display = 'none'
            t.parentElement?.classList.add('flex', 'items-center', 'justify-center')
          }}
        />

        {/* Image placeholder (shows when no image) */}
        <div className="absolute inset-0 flex items-center justify-center bg-ms-cream pointer-events-none">
          <div className="text-center select-none">
            <span className="font-serif text-4xl font-bold text-ms-gray-light leading-none block">M7</span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-ms-gray mt-1 block">
              {product.category}
            </span>
          </div>
        </div>
      </div>

      {/* Product info */}
      <div className="flex flex-col gap-4 p-4 flex-1">

        {/* Name + price row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif font-semibold text-ms-black text-base leading-snug">
            {product.name}
          </h3>
          <span className="font-mono text-sm text-ms-charcoal whitespace-nowrap shrink-0">
            ₱{product.price.toLocaleString()}
          </span>
        </div>

        {/* Size selector */}
        {product.sizes && product.sizes.length > 0 && (
          <div>
            <span
              className={`font-mono text-[10px] uppercase tracking-widest block mb-2 transition-colors ${
                sizeError ? 'text-red-500' : 'text-ms-gray'
              }`}
            >
              {sizeError ? 'Select a size' : 'Size'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-9 h-9 text-xs font-mono border transition-all duration-150 ${
                    selectedSize === size
                      ? 'bg-ms-black text-ms-white border-ms-black'
                      : sizeError
                      ? 'border-red-300 text-ms-charcoal hover:border-ms-black'
                      : 'border-ms-gray-light text-ms-charcoal hover:border-ms-black'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add to Cart button */}
        <button
          onClick={handleAddToCart}
          disabled={added}
          className={`mt-auto w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-mono uppercase tracking-widest transition-all duration-300 ${
            added
              ? 'bg-ms-blue text-ms-white cursor-default'
              : 'bg-ms-black text-ms-white hover:bg-ms-charcoal active:scale-[0.98]'
          }`}
        >
          {added ? (
            <>Added</>
          ) : (
            <>
              <ShoppingBag size={13} />
              Add to Cart
              <Plus size={13} />
            </>
          )}
        </button>
      </div>
    </article>
  )
}
