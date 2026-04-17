import { Link } from 'react-router-dom'
import { XCircle, ArrowLeft, ShoppingBag } from 'lucide-react'
import Logo from '../components/Logo'
import { useCartStore } from '../store/cartStore'

export default function Cancel() {
  const { openCart } = useCartStore()

  return (
    <div className="min-h-screen bg-ms-black flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">

      {/* Grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          opacity: 0.06,
        }}
      />

      <div className="relative w-full max-w-sm text-center z-10 flex flex-col items-center gap-6">

        <Logo inverted size="sm" />

        {/* Divider */}
        <div className="w-12 border-t border-ms-charcoal" />

        <XCircle size={36} className="text-ms-gray" />

        <div>
          <h1 className="font-serif font-bold text-2xl text-ms-white">
            Order Cancelled
          </h1>
          <p className="font-sans text-sm text-ms-gray mt-2 leading-relaxed max-w-xs mx-auto">
            Your payment was not completed. Your cart is still saved — no items were removed.
          </p>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-dashed border-ms-charcoal" />

        <p className="font-serif italic text-ms-gray text-sm">
          "Pwede ka pa bumalik."
        </p>

        {/* Actions */}
        <div className="flex flex-col w-full gap-3 mt-2">
          <Link
            to="/"
            onClick={openCart}
            className="flex items-center justify-center gap-2 w-full py-3 bg-ms-white text-ms-black font-mono text-[10px] uppercase tracking-widest hover:bg-ms-cream transition-colors"
          >
            <ShoppingBag size={12} />
            Back to Cart
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full py-3 border border-ms-charcoal text-ms-gray font-mono text-[10px] uppercase tracking-widest hover:border-ms-gray hover:text-ms-white transition-colors"
          >
            <ArrowLeft size={12} />
            Continue Shopping
          </Link>
        </div>

        <span className="font-mono text-[9px] uppercase tracking-widest text-ms-charcoal mt-2">
          MetroSevn · The Philippines
        </span>
      </div>
    </div>
  )
}
