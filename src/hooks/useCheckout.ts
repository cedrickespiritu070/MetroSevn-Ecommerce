import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useCartStore } from '../store/cartStore'

export interface ShippingDetails {
  fullName:   string
  email:      string
  phone:      string
  street:     string
  barangay:   string
  city:       string
  province:   string
  postalCode: string
}

interface CheckoutResult {
  orderId:     string | null
  totalAmount: number
  error:       string | null
}

export const SHIPPING_FEE              = 150   // PHP flat rate
export const FREE_SHIPPING_THRESHOLD   = 2500  // PHP — free above this subtotal

/**
 * Creates an order + order_items in Supabase with shipping details.
 * Called on form submit from the /checkout page.
 * Returns order_id + total_amount — ready for Stripe in Phase 2.
 * Guest checkout supported: user_id is null when not logged in.
 */
export function useCheckout() {
  const [loading, setLoading] = useState(false)
  const { items, totalPrice, clearCart } = useCartStore()

  async function checkout(shipping: ShippingDetails): Promise<CheckoutResult> {
    if (items.length === 0) {
      return { orderId: null, totalAmount: 0, error: 'Cart is empty.' }
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const subtotal    = totalPrice()
      const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
      const total       = subtotal + shippingFee

      // Generate UUID client-side — avoids needing a SELECT policy for anon
      // after insert. crypto.randomUUID() is available in all modern browsers.
      const orderId = crypto.randomUUID()

      // ── 1. Insert order with shipping details ────────────────────────────
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id:               orderId,
          user_id:          user?.id ?? null,
          status:           'pending',
          total_amount:     total,
          currency:         'PHP',
          shipping_details: shipping,
          metadata: {
            subtotal,
            shipping_fee: shippingFee,
          },
        })

      if (orderError) throw new Error(orderError.message)

      // ── 2. Insert order_items ────────────────────────────────────────────
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(
          items.map((item) => ({
            order_id:   orderId,
            product_id: item.id,
            quantity:   item.quantity,
            unit_price: item.price,
            size:       item.size,
          }))
        )

      if (itemsError) throw new Error(itemsError.message)

      // ── 3. Clear cart ────────────────────────────────────────────────────
      clearCart()

      return { orderId, totalAmount: total, error: null }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Checkout failed.'
      return { orderId: null, totalAmount: 0, error: message }
    } finally {
      setLoading(false)
    }
  }

  return { checkout, loading }
}
