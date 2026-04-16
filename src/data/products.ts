import type { Product } from '../types'

/**
 * Mock product catalogue — mirrors the Supabase `products` table schema.
 * Replace `image_url` values with actual Supabase Storage public URLs
 * once you upload the apparel mockups.
 *
 * Flagship: "Commute Pa More!" — features the blue Jeepney graphic
 * (blue handwritten text, Jeepney illustration, pedestrian silhouettes)
 * as the direct garment print.
 */
export const mockProducts: Product[] = [
  {
    id: 'ms-001',
    created_at: new Date().toISOString(),
    name: 'Commute Pa More! Hoodie',
    description:
      'The MetroSevn flagship. Heavyweight 380gsm french terry hoodie featuring the full "Commute Pa More!" graphic — blue Jeepney illustration, handwritten lettering, and pedestrian silhouettes screen-printed on chest. Oversized boxy fit.',
    price: 1850,
    image_url: '/assets/commute-hoodie-front.jpg',
    category: 'hoodie',
    stock: 40,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    tags: ['flagship', 'new-arrival', 'graphic'],
  },
  {
    id: 'ms-002',
    created_at: new Date().toISOString(),
    name: 'Commute Pa More! Tee',
    description:
      'Same iconic "Commute Pa More!" Jeepney graphic on a 220gsm heavyweight tee. Slightly cropped, boxy fit. Ribbed collar. The everyday staple of the collection.',
    price: 1200,
    image_url: '/assets/commute-tee-front.jpg',
    category: 'tee',
    stock: 60,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    tags: ['flagship', 'new-arrival', 'graphic'],
  },
  {
    id: 'ms-003',
    created_at: new Date().toISOString(),
    name: 'MetroSevn Wave Tee',
    description:
      'Clean and minimal. The MetroSevn wave mark embroidered at chest-left on a 220gsm premium cotton tee. Unisex, relaxed fit. The foundation piece.',
    price: 990,
    image_url: '/assets/wave-tee-white.jpg',
    category: 'tee',
    stock: 80,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    tags: ['essential', 'minimal'],
  },
  {
    id: 'ms-004',
    created_at: new Date().toISOString(),
    name: 'MetroSevn Wave Cap',
    description:
      '6-panel structured cap in washed cotton. Embroidered wave mark at front. Adjustable back strap. One size.',
    price: 750,
    image_url: '/assets/wave-cap-black.jpg',
    category: 'cap',
    stock: 35,
    sizes: ['M'],
    tags: ['accessories', 'essential'],
  },
]
