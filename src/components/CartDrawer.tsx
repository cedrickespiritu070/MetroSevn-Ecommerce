import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'

export default function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQuantity, totalItems, totalPrice } =
    useCartStore()
  const navigate = useNavigate()

  const count = totalItems()
  const total = totalPrice()

  function handleCheckout() {
    closeCart()
    navigate('/checkout')
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-ms-black/40 backdrop-blur-sm z-50 animate-fade-in"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-ms-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-ms-gray-light">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-ms-charcoal" />
            <span className="font-mono text-xs uppercase tracking-widest text-ms-charcoal">
              Cart ({count})
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-1 text-ms-gray hover:text-ms-black transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
              <ShoppingBag size={40} className="text-ms-gray-light" />
              <div>
                <p className="font-serif font-semibold text-ms-charcoal text-lg">Your cart is empty</p>
                <p className="font-sans text-sm text-ms-gray mt-1">Add something from the collection.</p>
              </div>
              <button
                onClick={closeCart}
                className="mt-4 font-mono text-xs uppercase tracking-widest underline underline-offset-4 text-ms-charcoal hover:text-ms-blue transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-ms-gray-light">
              {items.map((item) => (
                <li key={`${item.id}-${item.size}`} className="py-5 flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-24 bg-ms-cream shrink-0 overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex flex-col flex-1 gap-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <p className="font-serif font-semibold text-sm text-ms-black leading-snug">
                        {item.name}
                      </p>
                      <button
                        onClick={() => removeItem(item.id, item.size)}
                        className="text-ms-gray hover:text-ms-black transition-colors shrink-0"
                        aria-label="Remove item"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <span className="font-mono text-[10px] text-ms-gray uppercase tracking-widest">
                      Size: {item.size}
                    </span>

                    <div className="flex items-center justify-between mt-auto">
                      {/* Qty controls */}
                      <div className="flex items-center border border-ms-gray-light">
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-ms-charcoal hover:bg-ms-cream transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center font-mono text-xs text-ms-charcoal">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-ms-charcoal hover:bg-ms-cream transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Line total */}
                      <span className="font-mono text-sm text-ms-charcoal">
                        ₱{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-ms-gray-light flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs uppercase tracking-widest text-ms-gray">Subtotal</span>
              <span className="font-serif font-bold text-xl text-ms-black">
                ₱{total.toLocaleString()}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 py-4 bg-ms-black text-ms-white font-mono text-xs uppercase tracking-widest hover:bg-ms-charcoal transition-colors active:scale-[0.98]"
            >
              Proceed to Checkout
              <ArrowRight size={14} />
            </button>
            <p className="text-center font-mono text-[9px] uppercase tracking-widest text-ms-gray">
              Shipping calculated at checkout
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
