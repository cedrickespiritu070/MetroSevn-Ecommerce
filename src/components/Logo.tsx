/**
 * MetroSevn brand mark.
 * The SVG wave/W icon mirrors the stylised wave mark from the brand assets —
 * two peaks representing the letter M/W and the Metro skyline silhouette,
 * rendered in the brand's dark serif weight.
 */
interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  inverted?: boolean
}

const sizes = {
  sm: { icon: 28, text: 'text-sm tracking-widest2' },
  md: { icon: 38, text: 'text-base tracking-widest2' },
  lg: { icon: 54, text: 'text-xl tracking-widest2' },
}

export default function Logo({ className = '', size = 'md', inverted = false }: LogoProps) {
  const { icon, text } = sizes[size]
  const color = inverted ? '#FAFAFA' : '#0A0A0A'

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Wave / W icon */}
      <svg
        width={icon}
        height={icon * 0.66}
        viewBox="0 0 54 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Wave mark — two arcs evoking a W and the Metro skyline */}
        <path
          d="M2 28 L10 8 L18 22 L27 4 L36 22 L44 8 L52 28"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Baseline dot — the punctuation of the mark */}
        <circle cx="27" cy="33" r="2.5" fill={color} />
      </svg>

      {/* Brand name */}
      <span
        className={`font-serif font-bold uppercase ${text}`}
        style={{ color, letterSpacing: '0.25em' }}
      >
        METROSEVN
      </span>
    </div>
  )
}
