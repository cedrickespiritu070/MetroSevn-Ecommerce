Stack
                                                                                                                                                                                
  - Vite + React 19 + TypeScript 5.7                        
  - Tailwind CSS 3 (custom brand tokens)
  - Supabase (DB + Storage + Auth)
  - Zustand (cart state, persisted to localStorage)
  - React Router v7
  - Lucide React (icons)

  ---
  Brand Design System

  - Colors: ms-black #0A0A0A, ms-charcoal #1A1A1A, ms-blue #1B3670 (Jeepney graphic), ms-cream #F5F4F0, ms-white #FAFAFA, ms-gray #9A9A9A, ms-gray-light #E8E7E3
  - Fonts: Playfair Display (serif/headings), DM Sans (body), DM Mono (labels/prices)
  - Grain texture: Animated SVG fractalNoise on body::after (opacity 0.038)
  - Brand: Lipa, Batangas, Philippines. Copy uses "The Philippines" (not Metro Manila)

  ---
  File Structure

  src/
  ├── assets/
  │   ├── metrosevn-logo.svg
  │   └── commute-graphic.jpg
  ├── components/
  │   ├── Logo.tsx          — SVG logo img, height-based sizing, invert prop
  │   ├── Navbar.tsx        — Fixed, frosted glass, mobile drawer, cart badge
  │   ├── ProductCard.tsx   — Size selector, add-to-cart, imgError fallback state
  │   ├── ProductGrid.tsx   — 1px gap grid-line layout, skeleton loader
  │   └── CartDrawer.tsx    — Slide-in right, qty controls, navigates to /checkout
  ├── data/
  │   └── products.ts       — 4 mock products (Commute Pa More! Hoodie, Tee, Wave Tee, Cap)
  ├── hooks/
  │   ├── useProducts.ts    — Fetches from Supabase, falls back to mock data
  │   └── useCheckout.ts    — Creates order + order_items, crypto.randomUUID() client-side
  ├── lib/
  │   └── supabase.ts       — Supabase client + fetchProducts()
  ├── pages/
  │   ├── Home.tsx          — Hero split, marquee, product grid, about strip, footer
  │   ├── Checkout.tsx      — Shipping form + order summary, SHIPPING_FEE ₱150, free ≥ ₱2500
  │   ├── Success.tsx       — Receipt page, reads router state (guest) or fetches (auth)
  │   └── Cancel.tsx        — Cancellation page, restores cart CTA
  ├── store/
  │   └── cartStore.ts      — Zustand: add/remove/qty/persist, isOpen drawer state
  └── types/
      └── index.ts          — Product, CartItem, ProductSize interfaces

  ---
  Supabase Database Schema

  3 tables:

  -- products (already seeded with 4 items)
  id uuid PK | name text | description text | price numeric
  image_url text | category product_category enum | stock int
  sizes product_size[] | tags text[] | created_at timestamptz

  -- orders
  id uuid PK | user_id uuid FK auth.users (nullable = guest)
  status order_status enum (pending/paid/cancelled/shipped)
  total_amount numeric | currency text default 'PHP'
  shipping_details jsonb | metadata jsonb | created_at timestamptz

  -- order_items
  id uuid PK | order_id FK orders | product_id FK products
  quantity int | unit_price numeric | size text

  RLS Policies:
  - products — public SELECT, authenticated INSERT/UPDATE/DELETE
  - orders — anon+authenticated INSERT, authenticated SELECT own rows
  - order_items — anon+authenticated INSERT, authenticated SELECT own order items

  Grants applied:
  grant insert, select on public.orders to anon, authenticated;
  grant insert, select on public.order_items to anon, authenticated;

  ---
  User Flow (current)

  Home → Browse Products
    → Add to Cart (size required) → Cart Drawer
      → "Proceed to Checkout" → /checkout
        → Shipping form (Name, Email, Phone, Street, Barangay, City, Province, Postal)
        → Order summary sidebar (items + shipping fee + total)
        → Submit → useCheckout(shippingDetails)
            → crypto.randomUUID() client-side (avoids SELECT after INSERT)
            → INSERT orders (with shipping_details, metadata: {subtotal, shipping_fee})
            → INSERT order_items
            → clearCart()
            → navigate /success with router state {order, items snapshot}
        → /success — receipt page (grainy B&W, perforated edges, "Salamat. Commute pa more.")
        → /cancel  — cancellation page with "Back to Cart" CTA

  ---
  Key Technical Decisions

  1. UUID generated client-side (crypto.randomUUID()) — avoids needing a SELECT policy for anon users after INSERT
  2. Success page uses router state (not Supabase fetch) for guest users — avoids anon SELECT policy requirement. Falls back to Supabase fetch for authenticated users / Stripe
  redirects
  3. Mock data fallback in useProducts — app works without .env configured
  4. Cart persisted to localStorage via Zustand persist middleware

  ---
  Phase 2 Entry Point

  In src/pages/Checkout.tsx around line 80:
  // TODO: Replace with Stripe Edge Function call
  // const { url } = await createStripeSession({ orderId, totalAmount })
  // window.location.href = url
  At this point you have: orderId (saved in Supabase), totalAmount (with shipping), and form (shipping details). Pass these to a Supabase Edge Function that creates a Stripe
  Checkout Session.

  ---
  .env Required

  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key