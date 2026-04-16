import { ShoppingBag, Menu, X } from 'lucide-react'
import { useState } from 'react'
import Logo from './Logo'
import { useCartStore } from '../store/cartStore'

const navLinks = [
  { label: 'Collection', href: '#collection' },
  { label: 'About',      href: '#about' },
  { label: 'Stockists',  href: '#stockists' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { toggleCart, totalItems } = useCartStore()
  const count = totalItems()

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-ms-white/90 backdrop-blur-md border-b border-ms-gray-light">
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1 text-ms-charcoal"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo — centred on mobile, left on desktop */}
          <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
            <Logo size="sm" />
          </div>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="font-sans text-xs uppercase tracking-widest2 text-ms-charcoal hover:text-ms-blue transition-colors duration-200"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Cart icon */}
          <button
            onClick={toggleCart}
            className="relative p-1 text-ms-charcoal hover:text-ms-blue transition-colors"
            aria-label={`Cart (${count} items)`}
          >
            <ShoppingBag size={22} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-ms-blue text-ms-white text-[9px] font-mono font-medium flex items-center justify-center leading-none">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 pt-16 bg-ms-white animate-fade-in">
          <nav className="flex flex-col items-center justify-center h-full gap-10">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="font-serif text-3xl font-bold text-ms-charcoal hover:text-ms-blue transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
