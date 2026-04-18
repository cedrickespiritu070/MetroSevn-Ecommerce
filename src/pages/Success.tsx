import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useLocation, Link } from 'react-router-dom'
import { CheckCircle, ArrowLeft, Package, Home, Loader2, Printer } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { CartItem } from '../types'
import Logo from '../components/Logo'

interface OrderItem {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  size: string
  products: { name: string }[] | null
}

interface Order {
  id: string
  created_at: string
  status: string
  total_amount: number
  currency: string
  metadata?: { subtotal?: number; shipping_fee?: number }
}

interface LocationState {
  order: Order
  items: CartItem[]
}

const POLL_MAX      = 10
const POLL_INTERVAL = 2000

export default function Success() {
  const [params]    = useSearchParams()
  const location    = useLocation()
  const orderId     = params.get('order_id')
  const routerState = location.state as LocationState | null

  const sessionRaw  = orderId ? sessionStorage.getItem(`order_${orderId}`) : null
  const sessionData: LocationState | null = sessionRaw ? JSON.parse(sessionRaw) : null
  const initialState = routerState ?? sessionData

  // Came from Stripe redirect — webhook fires async so we need to poll
  const fromStripe = !!initialState

  const [order, setOrder]       = useState<Order | null>(initialState?.order ?? null)
  const [items, setItems]       = useState<OrderItem[]>([])
  const [loading, setLoading]   = useState(!initialState?.items)
  const [verifying, setVerifying] = useState(fromStripe)

  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Hydrate items from session/router state immediately (avoids blank receipt flash)
    if (initialState?.items) {
      setItems(
        initialState.items.map((i) => ({
          id:         i.id,
          product_id: i.id,
          quantity:   i.quantity,
          unit_price: i.price,
          size:       i.size,
          products:   [{ name: i.name }],
        }))
      )
      setLoading(false)
      if (orderId) sessionStorage.removeItem(`order_${orderId}`)
    }

    if (!orderId) {
      setLoading(false)
      setVerifying(false)
      return
    }

    // Fetch items from DB if we don't have them
    if (!initialState?.items) {
      supabase
        .from('order_items')
        .select('id, product_id, quantity, unit_price, size, products(name)')
        .eq('order_id', orderId)
        .then(({ data }) => {
          if (data) setItems(data as OrderItem[])
          setLoading(false)
        })
    }

    // Poll DB until status = 'paid' (webhook fires async after Stripe redirect)
    let retries = 0

    async function pollOrder() {
      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, status, total_amount, currency, metadata')
        .eq('id', orderId!)
        .single()

      if (data) setOrder(data)

      // Stop on success, max retries, or a hard error (e.g. 406 RLS block)
      if (data?.status === 'paid' || retries >= POLL_MAX || (error && error.code !== 'PGRST116')) {
        // If we came from Stripe but couldn't confirm via DB, trust Stripe
        if (fromStripe && !data) {
          setOrder((prev) => prev ? { ...prev, status: 'paid' } : null)
        }
        setVerifying(false)
        return
      }

      if (fromStripe) {
        retries++
        pollRef.current = setTimeout(pollOrder, POLL_INTERVAL)
      } else {
        setVerifying(false)
      }
    }

    pollOrder()

    return () => {
      if (pollRef.current) clearTimeout(pollRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  const shortId = orderId ? orderId.slice(0, 8).toUpperCase() : '--------'
  const date = order
    ? new Date(order.created_at).toLocaleDateString('en-PH', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : new Date().toLocaleDateString('en-PH', {
        year: 'numeric', month: 'long', day: 'numeric',
      })

  const displayStatus = verifying ? 'verifying' : (order?.status ?? (fromStripe ? 'paid' : 'pending'))
  const subtotal   = order?.metadata?.subtotal
  const shippingFee = order?.metadata?.shipping_fee

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

      {/* Receipt card */}
      <div className="relative w-full max-w-md bg-ms-white z-10">

        {/* Perforated top edge */}
        <div
          className="w-full h-4 bg-ms-white"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 0%, #0A0A0A 6px, transparent 6px)',
            backgroundSize: '20px 16px',
            backgroundRepeat: 'repeat-x',
          }}
        />

        <div className="px-8 pb-10 pt-2">

          {/* Logo */}
          <div className="flex justify-center mt-4 mb-6">
            <Logo size="sm" />
          </div>

          <div className="border-t border-dashed border-ms-gray-light my-4" />

          {/* Payment status banner */}
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              verifying ? 'bg-ms-gray-light' : 'bg-ms-blue/10'
            }`}>
              {verifying
                ? <Loader2 size={20} className="text-ms-gray animate-spin" />
                : <CheckCircle size={20} className="text-ms-blue" />
              }
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-ms-charcoal">
              {verifying ? 'Verifying Payment...' : 'Payment Confirmed'}
            </span>
            <span className={`font-mono text-[9px] uppercase tracking-widest px-3 py-1 ${
              verifying ? 'bg-ms-gray-light text-ms-gray' : 'bg-ms-blue/10 text-ms-blue'
            }`}>
              {verifying ? '⏳ Processing' : '✓ Paid'}
            </span>
          </div>

          {/* Order meta */}
          <div className="flex flex-col gap-2.5 mb-6">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ms-gray">Order No.</span>
              <span className="font-mono text-xs font-medium text-ms-black"># {shortId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ms-gray">Date</span>
              <span className="font-mono text-xs text-ms-charcoal">{date}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ms-gray">Status</span>
              <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 inline-flex items-center gap-1 ${
                verifying
                  ? 'text-ms-gray'
                  : displayStatus === 'paid'
                  ? 'bg-ms-blue/10 text-ms-blue'
                  : 'text-ms-gray'
              }`}>
                {verifying && <Loader2 size={8} className="animate-spin" />}
                {verifying ? 'Verifying' : displayStatus}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ms-gray">Payment</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-ms-charcoal">Card</span>
            </div>
          </div>

          <div className="border-t border-dashed border-ms-gray-light my-4" />

          {/* Line items */}
          {loading ? (
            <div className="flex flex-col gap-3 animate-pulse">
              {[1, 2].map(i => (
                <div key={i} className="flex justify-between">
                  <div className="h-3 bg-ms-gray-light rounded w-1/2" />
                  <div className="h-3 bg-ms-gray-light rounded w-1/5" />
                </div>
              ))}
            </div>
          ) : items.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="font-sans text-xs text-ms-black leading-snug">
                      {item.products?.[0]?.name ?? `Product ${item.product_id.slice(0, 6)}`}
                    </span>
                    <span className="font-mono text-[9px] text-ms-gray uppercase tracking-widest mt-0.5">
                      Size: {item.size} · Qty: {item.quantity}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-ms-charcoal whitespace-nowrap">
                    ₱{(item.unit_price * item.quantity).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-2 text-ms-gray justify-center py-2">
              <Package size={14} />
              <span className="font-mono text-[10px] uppercase tracking-widest">Items unavailable</span>
            </div>
          )}

          <div className="border-t border-dashed border-ms-gray-light my-4" />

          {/* Order breakdown */}
          <div className="flex flex-col gap-2 mb-1">
            {subtotal !== undefined && (
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ms-gray">Subtotal</span>
                <span className="font-mono text-xs text-ms-charcoal">₱{subtotal.toLocaleString()}</span>
              </div>
            )}
            {shippingFee !== undefined && (
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ms-gray">Shipping Fee</span>
                {shippingFee === 0 ? (
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ms-blue">Free</span>
                ) : (
                  <span className="font-mono text-xs text-ms-charcoal">₱{shippingFee.toLocaleString()}</span>
                )}
              </div>
            )}
          </div>

          {(subtotal !== undefined || shippingFee !== undefined) && (
            <div className="border-t border-dashed border-ms-gray-light my-3" />
          )}

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ms-gray">Total Paid</span>
            <span className="font-serif font-bold text-xl text-ms-black">
              ₱{(order?.total_amount ?? 0).toLocaleString()}
            </span>
          </div>

          <div className="border-t border-dashed border-ms-gray-light my-6" />

          {/* Thank you */}
          <p className="font-serif italic text-center text-ms-charcoal text-sm leading-relaxed">
            "Salamat. Commute pa more."
          </p>
          <p className="font-mono text-[9px] uppercase tracking-widest text-ms-gray text-center mt-2">
            MetroSevn · The Philippines
          </p>

          {/* CTAs */}
          <div className="flex flex-col gap-2 mt-8">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-ms-black text-ms-white font-mono text-[10px] uppercase tracking-widest hover:bg-ms-charcoal transition-colors"
            >
              <Home size={12} />
              Return to Home
            </Link>
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 w-full py-3 border border-ms-gray-light text-ms-charcoal font-mono text-[10px] uppercase tracking-widest hover:border-ms-black transition-colors"
            >
              <Printer size={12} />
              Print Receipt
            </button>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 w-full py-3 border border-ms-gray-light text-ms-charcoal font-mono text-[10px] uppercase tracking-widest hover:border-ms-black transition-colors"
            >
              <ArrowLeft size={12} />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Perforated bottom edge */}
        <div
          className="w-full h-4 bg-ms-white"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 100%, #0A0A0A 6px, transparent 6px)',
            backgroundSize: '20px 16px',
            backgroundRepeat: 'repeat-x',
          }}
        />
      </div>

      {/* Full order ref */}
      {orderId && (
        <p className="mt-6 font-mono text-[9px] text-ms-gray uppercase tracking-widest z-10">
          Ref: {orderId}
        </p>
      )}
    </div>
  )
}
