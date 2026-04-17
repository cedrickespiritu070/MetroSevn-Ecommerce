import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, Package, ChevronRight } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useCheckout, SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from '../hooks/useCheckout'
import type { ShippingDetails } from '../hooks/useCheckout'
import Logo from '../components/Logo'

// ── Reusable underline-style input ──────────────────────────────────────────
interface FieldProps {
  label: string
  name: keyof ShippingDetails
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  placeholder?: string
  required?: boolean
  half?: boolean
}

function Field({ label, name, value, onChange, type = 'text', placeholder, required = true, half }: FieldProps) {
  return (
    <div className={half ? 'col-span-1' : 'col-span-2'}>
      <label className="block font-mono text-[10px] uppercase tracking-widest text-ms-gray mb-1">
        {label}{required && <span className="text-ms-blue ml-0.5">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full bg-transparent border-b border-ms-gray-light focus:border-ms-black outline-none py-2.5 font-sans text-sm text-ms-black placeholder:text-ms-gray transition-colors duration-150"
      />
    </div>
  )
}

// ── Checkout Page ────────────────────────────────────────────────────────────
const EMPTY_FORM: ShippingDetails = {
  fullName:   '',
  email:      '',
  phone:      '',
  street:     '',
  barangay:   '',
  city:       '',
  province:   '',
  postalCode: '',
}

export default function Checkout() {
  const { items, totalPrice } = useCartStore()
  const { checkout, loading }  = useCheckout()
  const navigate               = useNavigate()

  const [form, setForm]     = useState<ShippingDetails>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)

  const subtotal    = totalPrice()
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const total       = subtotal + shippingFee

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    // Capture items before checkout clears the cart
    const snapshot = items.map((i) => ({ ...i }))

    const { orderId, totalAmount, error } = await checkout(form)

    if (error) {
      setFormError(error)
      return
    }

    // TODO: Replace with Stripe Edge Function call
    // const { url } = await createStripeSession({ orderId, totalAmount })
    // window.location.href = url
    console.log('[MetroSevn] Order ready for payment:', { orderId, total: totalAmount })

    // Pass order data via router state — Success page uses this directly
    // so it never needs to SELECT from Supabase (no anon SELECT policy needed)
    navigate(`/success?order_id=${orderId}`, {
      state: {
        order: {
          id:           orderId,
          created_at:   new Date().toISOString(),
          status:       'pending',
          total_amount: totalAmount,
          currency:     'PHP',
        },
        items: snapshot,
      },
    })
  }

  // Guard — if cart is empty, redirect home
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Package size={36} className="text-ms-gray-light" />
        <p className="font-serif font-semibold text-ms-charcoal text-lg">Your cart is empty.</p>
        <Link
          to="/"
          className="font-mono text-xs uppercase tracking-widest underline underline-offset-4 text-ms-charcoal hover:text-ms-blue transition-colors"
        >
          Back to Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ms-white relative">

      {/* Grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          opacity: 0.03,
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-16">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6 mb-10 md:mb-14">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-ms-gray hover:text-ms-black transition-colors w-fit"
          >
            <ArrowLeft size={11} />
            Back to Shop
          </Link>

          {/* Step breadcrumb */}
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
            <span className="text-ms-gray">Cart</span>
            <ChevronRight size={10} className="text-ms-gray-light" />
            <span className="text-ms-black font-medium">Shipping</span>
            <ChevronRight size={10} className="text-ms-gray-light" />
            <span className="text-ms-gray">Payment</span>
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-ms-gray block mb-1">
              Step 1 of 2
            </span>
            <h1 className="font-serif font-bold text-3xl md:text-4xl text-ms-black">
              Shipping Details.
            </h1>
          </div>
        </div>

        {/* ── Main grid ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-16 items-start">

          {/* ── LEFT: Form ──────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} noValidate>

            {/* Contact */}
            <section className="mb-10">
              <h2 className="font-mono text-[10px] uppercase tracking-widest text-ms-blue mb-6 pb-2 border-b border-ms-gray-light">
                Contact Information
              </h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                <Field label="Full Name"     name="fullName" value={form.fullName} onChange={handleChange} placeholder="Juan dela Cruz" />
                <Field label="Email Address" name="email"    value={form.email}    onChange={handleChange} type="email" placeholder="juan@email.com" half />
                <Field label="Phone Number"  name="phone"    value={form.phone}    onChange={handleChange} type="tel"   placeholder="+63 9XX XXX XXXX" half />
              </div>
            </section>

            {/* Shipping address */}
            <section className="mb-10">
              <h2 className="font-mono text-[10px] uppercase tracking-widest text-ms-blue mb-6 pb-2 border-b border-ms-gray-light">
                Shipping Address
              </h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                <Field label="Street / House No. / Bldg" name="street"     value={form.street}     onChange={handleChange} placeholder="123 Rizal Street" />
                <Field label="Barangay"                  name="barangay"   value={form.barangay}   onChange={handleChange} placeholder="Brgy. San Sebastian" half />
                <Field label="City / Municipality"       name="city"       value={form.city}       onChange={handleChange} placeholder="Lipa City" half />
                <Field label="Province"                  name="province"   value={form.province}   onChange={handleChange} placeholder="Batangas" half />
                <Field label="Postal Code"               name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="4217" half />
              </div>
            </section>

            {/* Error */}
            {formError && (
              <p className="font-mono text-xs text-red-500 mb-6 border border-red-200 px-4 py-3 bg-red-50">
                {formError}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-ms-black text-ms-white font-mono text-xs uppercase tracking-widest hover:bg-ms-charcoal transition-colors active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Processing Order...
                </>
              ) : (
                <>
                  Proceed to Payment
                  <ChevronRight size={14} />
                </>
              )}
            </button>

            <p className="font-mono text-[9px] uppercase tracking-widest text-ms-gray text-center mt-3">
              Secure checkout · Your info is encrypted
            </p>
          </form>

          {/* ── RIGHT: Order Summary ─────────────────────────────────────── */}
          <aside className="lg:sticky lg:top-24">
            <div className="border border-ms-gray-light bg-ms-white">

              {/* Summary header */}
              <div className="px-6 py-4 border-b border-ms-gray-light flex items-center gap-2">
                <Package size={14} className="text-ms-charcoal" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-ms-charcoal">
                  Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
                </span>
              </div>

              {/* Items */}
              <ul className="divide-y divide-ms-gray-light max-h-72 overflow-y-auto">
                {items.map((item) => (
                  <li key={`${item.id}-${item.size}`} className="px-6 py-4 flex gap-3 items-start">
                    <div className="w-14 h-16 bg-ms-cream shrink-0 overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-semibold text-xs text-ms-black leading-snug line-clamp-2">
                        {item.name}
                      </p>
                      <p className="font-mono text-[9px] text-ms-gray uppercase tracking-widest mt-1">
                        Size: {item.size} · Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-ms-charcoal shrink-0">
                      ₱{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Totals */}
              <div className="px-6 py-4 border-t border-ms-gray-light flex flex-col gap-2.5">
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ms-gray">Subtotal</span>
                  <span className="font-mono text-xs text-ms-charcoal">₱{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ms-gray">Shipping</span>
                  {shippingFee === 0 ? (
                    <span className="font-mono text-xs text-ms-blue uppercase tracking-widest">Free</span>
                  ) : (
                    <span className="font-mono text-xs text-ms-charcoal">₱{shippingFee.toLocaleString()}</span>
                  )}
                </div>

                {shippingFee > 0 && (
                  <p className="font-mono text-[9px] text-ms-gray">
                    Free shipping on orders ₱{FREE_SHIPPING_THRESHOLD.toLocaleString()}+
                  </p>
                )}

                <div className="flex justify-between pt-2 border-t border-ms-gray-light mt-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ms-charcoal">Total</span>
                  <span className="font-serif font-bold text-lg text-ms-black">
                    ₱{total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Brand footer */}
              <div className="px-6 py-4 border-t border-ms-gray-light flex justify-center">
                <Logo size="sm" />
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}
