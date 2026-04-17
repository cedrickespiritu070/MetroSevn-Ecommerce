import { useEffect, useState } from 'react'
import { useSearchParams, useLocation, Link } from 'react-router-dom'
import { CheckCircle, ArrowLeft, Package } from 'lucide-react'
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
}

interface LocationState {
  order: Order
  items: CartItem[]
}

export default function Success() {
  const [params]   = useSearchParams()
  const location   = useLocation()
  const orderId    = params.get('order_id')
  const routerState = location.state as LocationState | null

  const [order, setOrder]     = useState<Order | null>(routerState?.order ?? null)
  const [items, setItems]     = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(!routerState)

  // Populate items from router state (guest) or convert cart items
  useEffect(() => {
    if (routerState?.items) {
      // Map CartItem → display shape (no Supabase fetch needed)
      setItems(
        routerState.items.map((i) => ({
          id:         i.id,
          product_id: i.id,
          quantity:   i.quantity,
          unit_price: i.price,
          size:       i.size,
          products:   [{ name: i.name }],
        }))
      )
      setLoading(false)
      return
    }

    // Fallback: fetch from Supabase (authenticated users / Stripe redirect)
    if (!orderId) { setLoading(false); return }

    async function fetchOrder() {
      const [{ data: orderData }, { data: itemsData }] = await Promise.all([
        supabase
          .from('orders')
          .select('id, created_at, status, total_amount, currency')
          .eq('id', orderId)
          .single(),
        supabase
          .from('order_items')
          .select('id, product_id, quantity, unit_price, size, products(name)')
          .eq('order_id', orderId),
      ])

      if (orderData) setOrder(orderData)
      if (itemsData) setItems(itemsData as OrderItem[])
      setLoading(false)
    }

    fetchOrder()
  }, [orderId, routerState])

  const shortId = orderId ? orderId.slice(0, 8).toUpperCase() : '--------'
  const date = order
    ? new Date(order.created_at).toLocaleDateString('en-PH', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : new Date().toLocaleDateString('en-PH', {
        year: 'numeric', month: 'long', day: 'numeric',
      })

  return (
    <div className="min-h-screen bg-ms-black flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">

      {/* Grain overlay on dark bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          opacity: 0.06,
        }}
      />

      {/* Receipt card */}
      <div className="relative w-full max-w-md bg-ms-white z-10">

        {/* Receipt top — perforated edge simulation */}
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

          {/* Divider */}
          <div className="border-t border-dashed border-ms-gray-light my-4" />

          {/* Status */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <CheckCircle size={18} className="text-ms-blue" />
            <span className="font-mono text-xs uppercase tracking-widest text-ms-charcoal">
              Order Confirmed
            </span>
          </div>

          {/* Order meta */}
          <div className="flex flex-col gap-1 mb-6">
            <div className="flex justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ms-gray">Order No.</span>
              <span className="font-mono text-xs font-medium text-ms-black"># {shortId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ms-gray">Date</span>
              <span className="font-mono text-xs text-ms-charcoal">{date}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ms-gray">Status</span>
              <span className="font-mono text-xs uppercase tracking-widest text-ms-blue">
                {order?.status ?? 'Pending'}
              </span>
            </div>
          </div>

          {/* Divider */}
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
                      {item.products?.[0]?.name ?? `Product ${item.product_id.slice(0,6)}`}
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

          {/* Divider */}
          <div className="border-t border-dashed border-ms-gray-light my-4" />

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ms-gray">Total Paid</span>
            <span className="font-serif font-bold text-xl text-ms-black">
              ₱{(order?.total_amount ?? 0).toLocaleString()}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-ms-gray-light my-6" />

          {/* Thank you */}
          <p className="font-serif italic text-center text-ms-charcoal text-sm leading-relaxed">
            "Salamat. Commute pa more."
          </p>
          <p className="font-mono text-[9px] uppercase tracking-widest text-ms-gray text-center mt-2">
            MetroSevn · The Philippines
          </p>

          {/* CTA */}
          <Link
            to="/"
            className="mt-8 flex items-center justify-center gap-2 w-full py-3 bg-ms-black text-ms-white font-mono text-[10px] uppercase tracking-widest hover:bg-ms-charcoal transition-colors"
          >
            <ArrowLeft size={12} />
            Continue Shopping
          </Link>
        </div>

        {/* Receipt bottom — perforated edge */}
        <div
          className="w-full h-4 bg-ms-white"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 100%, #0A0A0A 6px, transparent 6px)',
            backgroundSize: '20px 16px',
            backgroundRepeat: 'repeat-x',
          }}
        />
      </div>

      {/* Full order ID below receipt */}
      {orderId && (
        <p className="mt-6 font-mono text-[9px] text-ms-gray uppercase tracking-widest z-10">
          Ref: {orderId}
        </p>
      )}
    </div>
  )
}
