import logoSrc from '../assets/metrosevn-logo.svg'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  inverted?: boolean
}

// Height-based sizing — more predictable than width across different SVG viewBoxes
const heights: Record<string, number> = { sm: 28, md: 40, lg: 56 }

export default function Logo({ className = '', size = 'md', inverted = false }: LogoProps) {
  return (
    <img
      src={logoSrc}
      alt="MetroSevn"
      style={{ height: heights[size], width: 'auto', display: 'block' }}
      className={`object-contain${inverted ? ' invert' : ''}${className ? ` ${className}` : ''}`}
    />
  )
}
