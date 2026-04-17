import { ArrowDown } from 'lucide-react'
import commuteGraphic from '../assets/commute-graphic.jpg'
import Logo from '../components/Logo'
import ProductGrid from '../components/ProductGrid'
import { useProducts } from '../hooks/useProducts'

export default function Home() {
  const { products, loading } = useProducts()

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col">

        {/**
         * Bold split layout — left half white, right half dark charcoal.
         * Inspired by image_2.png's black/white structural contrast.
         * The brand name is oversized and bleeds across both halves.
         */}
        <div className="flex-1 grid md:grid-cols-2 min-h-screen">

          {/* Left — white panel */}
          <div className="flex flex-col justify-end p-8 md:p-16 pt-28 md:pt-32 bg-ms-white">
            <div className="flex flex-col gap-6">
              <span className="font-mono text-[10px] uppercase tracking-widest2 text-ms-gray">
                SS 2025 · The Philippines
              </span>
              <h1 className="font-serif font-black leading-[0.92] text-[clamp(3.5rem,10vw,7rem)] text-ms-black">
                Metro<br />Sevn.
              </h1>
              <p className="font-sans text-sm text-ms-gray max-w-xs leading-relaxed">
                Streetwear rooted in the city. Designed for the commute, built for the streets.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <a
                  href="#collection"
                  className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest bg-ms-black text-ms-white px-6 py-3 hover:bg-ms-charcoal transition-colors"
                >
                  Shop Collection
                  <ArrowDown size={12} />
                </a>
              </div>
            </div>
          </div>

          {/* Right — dark panel with the Jeepney graphic placeholder */}
          <div
            className="relative flex items-center justify-center min-h-[50vh] md:min-h-0 overflow-hidden"
            style={{ backgroundColor: '#1B3670' }}
          >
            {/**
             * This area is where image_1.png (the "Commute Pa More!" Jeepney graphic)
             * is intended to be placed as a full-bleed background or featured image.
             * Replace the div below with your actual graphic asset.
             */}
            <img
              src={commuteGraphic}
              alt="Commute Pa More! — MetroSevn graphic"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />

            {/* Subtle grain overlay on the blue panel */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                opacity: 0.07,
              }}
            />
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="font-mono text-[8px] uppercase tracking-widest text-ms-gray">Scroll</span>
          <ArrowDown size={12} className="text-ms-gray" />
        </div>
      </section>

      {/* ── Marquee banner ────────────────────────────────────────────────── */}
      <div className="overflow-hidden bg-ms-black py-3 border-y border-ms-charcoal">
        <div
          className="flex whitespace-nowrap"
          style={{ animation: 'marquee 18s linear infinite' }}
        >
          {[...Array(6)].map((_, i) => (
            <span key={i} className="font-mono text-[10px] uppercase tracking-widest text-ms-gray px-8">
              MetroSevn · Streetwear · The Philippines · SS 2025 · Commute Pa More ·&nbsp;
            </span>
          ))}
        </div>
        <style>{`
          @keyframes marquee {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* ── Collection ────────────────────────────────────────────────────── */}
      <section id="collection" className="max-w-screen-2xl mx-auto px-5 md:px-8 py-16 md:py-24">

        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-14">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-ms-gray block mb-2">
              SS 2025 Drop 01
            </span>
            <h2 className="font-serif font-bold text-4xl md:text-5xl text-ms-black leading-tight">
              The Collection.
            </h2>
          </div>
          <p className="font-sans text-sm text-ms-gray max-w-sm leading-relaxed md:text-right">
            Graphic-forward pieces for the streets of the Philippines.
            Limited quantities. No restocks.
          </p>
        </div>

        <ProductGrid products={products} loading={loading} />
      </section>

      {/* ── About strip ───────────────────────────────────────────────────── */}
      <section
        id="about"
        className="relative overflow-hidden py-20 md:py-32 px-5 md:px-8"
        style={{ backgroundColor: '#0A0A0A' }}
      >
        {/* Grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            opacity: 0.06,
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <Logo inverted size="md" className="mx-auto mb-10" />
          <p className="font-serif italic text-2xl md:text-3xl text-ms-white leading-relaxed font-light">
            "Born from the commute, worn on the streets.<br />
            Proudly made in the Philippines."
          </p>
          <span className="mt-8 block font-mono text-[9px] uppercase tracking-widest text-ms-gray">
            MetroSevn — Est. 2024
          </span>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-ms-gray-light px-5 md:px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-ms-gray">
            © 2025 MetroSevn. All rights reserved.
          </span>
          <div className="flex gap-6">
            {['Instagram', 'TikTok', 'Facebook'].map((s) => (
              <a
                key={s}
                href="#"
                className="font-mono text-[9px] uppercase tracking-widest text-ms-gray hover:text-ms-black transition-colors"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  )
}
