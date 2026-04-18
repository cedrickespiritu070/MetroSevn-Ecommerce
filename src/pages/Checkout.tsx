import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, ChevronRight, Package } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useCheckout, SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from '../hooks/useCheckout'
import type { ShippingDetails } from '../hooks/useCheckout'
import Logo from '../components/Logo'
import { supabase } from '../lib/supabase'

// ── Validation ───────────────────────────────────────────────────────────────
type FormErrors = Partial<Record<keyof ShippingDetails, string>>

const FIELD_LABELS: Record<keyof ShippingDetails, string> = {
  fullName:   'Full name',
  email:      'Email address',
  phone:      'Phone number',
  street:     'Street address',
  barangay:   'Barangay',
  city:       'City / Municipality',
  province:   'Province',
  postalCode: 'Postal code',
}

function validateField(name: keyof ShippingDetails, value: string): string {
  if (!value.trim()) return `${FIELD_LABELS[name]} is required`
  if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Enter a valid email address'
  }
  if (name === 'phone') {
    const digits = value.replace(/\D/g, '')
    if (digits.length < 10 || (digits.startsWith('63') && digits.length !== 12)) {
      return 'Enter a valid PH number (e.g. +63 912 345 6789)'
    }
  }
  if (name === 'postalCode' && !/^\d{4}$/.test(value.trim())) {
    return 'Enter a valid 4-digit postal code'
  }
  return ''
}

function validateAll(form: ShippingDetails): FormErrors {
  const errs: FormErrors = {}
  for (const key of Object.keys(form) as Array<keyof ShippingDetails>) {
    const msg = validateField(key, form[key])
    if (msg) errs[key] = msg
  }
  return errs
}

// ── Phone formatter ──────────────────────────────────────────────────────────
function formatPhone(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = '63' + digits.slice(1)
  if (!digits.startsWith('63') && digits.length > 0) digits = '63' + digits
  const local = digits.slice(2, 12) // max 10 local digits
  let out = '+63'
  if (local.length > 0) out += ' ' + local.slice(0, 3)
  if (local.length > 3) out += ' ' + local.slice(3, 6)
  if (local.length > 6) out += ' ' + local.slice(6, 10)
  return out
}

// ── Reusable underline-style input ──────────────────────────────────────────
interface FieldProps {
  label:      string
  name:       keyof ShippingDetails
  value:      string
  onChange:   (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur:     (name: keyof ShippingDetails) => void
  type?:      string
  placeholder?: string
  required?:  boolean
  half?:      boolean
  error?:     string
}

function Field({ label, name, value, onChange, onBlur, type = 'text', placeholder, required = true, half, error }: FieldProps) {
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
        onBlur={() => onBlur(name)}
        placeholder={placeholder}
        required={required}
        className={`w-full bg-transparent border-b ${
          error
            ? 'border-red-400 focus:border-red-500'
            : 'border-ms-gray-light focus:border-ms-black'
        } outline-none py-2.5 font-sans text-sm text-ms-black placeholder:text-ms-gray transition-colors duration-150`}
      />
      {error && (
        <p className="font-mono text-[9px] uppercase tracking-widest text-red-500 mt-1.5">
          {error}
        </p>
      )}
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
  const { items, totalPrice, clearCart } = useCartStore()
  const { checkout, loading }  = useCheckout()
  const navigate = useNavigate()

  const [form, setForm]         = useState<ShippingDetails>(EMPTY_FORM)
  const [errors, setErrors]     = useState<FormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  // Silently redirect to shop if cart is empty — no dead-end screen
  useEffect(() => {
    if (items.length === 0) navigate('/', { replace: true })
  }, [items.length, navigate])

  const subtotal    = totalPrice()
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const total       = subtotal + shippingFee

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    const fieldName = name as keyof ShippingDetails

    const formatted = fieldName === 'phone' ? formatPhone(value) : value
    setForm((prev) => ({ ...prev, [fieldName]: formatted }))

    // Clear error for this field as user types
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: undefined }))
    }
  }

  function handleBlur(name: keyof ShippingDetails) {
    const msg = validateField(name, form[name])
    setErrors((prev) => ({ ...prev, [name]: msg || undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    const validationErrors = validateAll(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      // Scroll to first error
      const firstErrorField = document.querySelector('[data-invalid]') as HTMLElement
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    const { orderId, totalAmount, error } = await checkout(form)

    if (error) {
      setFormError(error)
      return
    }

    const { data, error: fnError } = await supabase.functions.invoke('create-checkout-session', {
      body: { orderId, total: totalAmount },
    })

    if (fnError || !data?.url) {
      setFormError(fnError?.message ?? 'Failed to create payment session. Please try again.')
      return
    }

    sessionStorage.setItem(`order_${orderId}`, JSON.stringify({
      order: {
        id:           orderId,
        created_at:   new Date().toISOString(),
        status:       'pending',
        total_amount: totalAmount,
        currency:     'PHP',
      },
      items: items.map((i) => ({ ...i })),
    }))

    clearCart()
    window.location.assign(data.url)
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
                <Field
                  label="Full Name"     name="fullName" value={form.fullName}
                  onChange={handleChange} onBlur={handleBlur}
                  placeholder="Juan dela Cruz"
                  error={errors.fullName}
                />
                <Field
                  label="Email Address" name="email"    value={form.email}
                  onChange={handleChange} onBlur={handleBlur}
                  type="email" placeholder="juan@email.com" half
                  error={errors.email}
                />
                <Field
                  label="Phone Number"  name="phone"    value={form.phone}
                  onChange={handleChange} onBlur={handleBlur}
                  type="tel" placeholder="+63 912 345 6789" half
                  error={errors.phone}
                />
              </div>
            </section>

            {/* Shipping address */}
            <section className="mb-10">
              <h2 className="font-mono text-[10px] uppercase tracking-widest text-ms-blue mb-6 pb-2 border-b border-ms-gray-light">
                Shipping Address
              </h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                <Field
                  label="Street / House No. / Bldg" name="street" value={form.street}
                  onChange={handleChange} onBlur={handleBlur}
                  placeholder="123 Rizal Street"
                  error={errors.street}
                />
                <Field
                  label="Barangay" name="barangay" value={form.barangay}
                  onChange={handleChange} onBlur={handleBlur}
                  placeholder="Brgy. San Sebastian" half
                  error={errors.barangay}
                />
                <Field
                  label="City / Municipality" name="city" value={form.city}
                  onChange={handleChange} onBlur={handleBlur}
                  placeholder="Lipa City" half
                  error={errors.city}
                />
                <Field
                  label="Province" name="province" value={form.province}
                  onChange={handleChange} onBlur={handleBlur}
                  placeholder="Batangas" half
                  error={errors.province}
                />
                <Field
                  label="Postal Code" name="postalCode" value={form.postalCode}
                  onChange={handleChange} onBlur={handleBlur}
                  placeholder="4217" half
                  error={errors.postalCode}
                />
              </div>
            </section>

            {/* General error */}
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

              {/* Totals breakdown */}
              <div className="px-6 py-4 border-t border-ms-gray-light flex flex-col gap-2.5">
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ms-gray">Subtotal</span>
                  <span className="font-mono text-xs text-ms-charcoal">₱{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ms-gray">Shipping Fee</span>
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
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ms-charcoal font-medium">
                    Total
                  </span>
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
