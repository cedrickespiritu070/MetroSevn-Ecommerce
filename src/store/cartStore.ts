import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, ProductSize } from '../types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean

  // Actions
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string, size: ProductSize) => void
  updateQuantity: (id: string, size: ProductSize, quantity: number) => void
  clearCart: () => void

  // Derived (computed via functions so they stay reactive)
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart:   () => set({ isOpen: true }),
      closeCart:  () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (incoming) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.id === incoming.id && i.size === incoming.size
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === incoming.id && i.size === incoming.size
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...incoming, quantity: 1 }] }
        })
      },

      removeItem: (id, size) => {
        set((state) => ({
          items: state.items.filter((i) => !(i.id === id && i.size === size)),
        }))
      },

      updateQuantity: (id, size, quantity) => {
        if (quantity < 1) {
          get().removeItem(id, size)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id && i.size === size ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      totalItems: () =>
        get().items.reduce((acc, i) => acc + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
    }),
    { name: 'metrosevn-cart' }
  )
)
