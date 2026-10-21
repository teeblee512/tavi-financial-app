/**
 * TAVI SVG Logo Components
 */

interface LogoProps {
  size?: number;
  variant?: 'emerald' | 'navy' | 'white' | 'mono';
  showWordmark?: boolean;
}

export function TaviLogo({ size = 32, variant = 'emerald', showWordmark = false }: LogoProps) {
  const bgColor = {
    emerald: '#047857',
    navy: '#0F172A',
    white: '#FFFFFF',
    mono: '#374151',
  }[variant];

  const fgColor = {
    emerald: '#A7F3D0',
    navy: '#A7F3D0',
    white: '#047857',
    mono: '#FFFFFF',
  }[variant];

  const accentColor = {
    emerald: '#10B981',
    navy: '#10B981',
    white: '#059669',
    mono: '#D1D5DB',
  }[variant];

  return (
    <span className="inline-flex items-center gap-2" aria-label="TAVI">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="8" fill={bgColor} />
        {/* T-bar top */}
        <rect x="6" y="8" width="20" height="4" rx="2" fill={fgColor} />
        {/* T-stem */}
        <rect x="13" y="12" width="6" height="9" rx="1.5" fill={fgColor} />
        {/* Connection dots representing movement/paths */}
        <circle cx="8.5" cy="24" r="2.5" fill={accentColor} />
        <circle cx="16" cy="24" r="2.5" fill={accentColor} />
        <circle cx="23.5" cy="24" r="2.5" fill={accentColor} />
        {/* Connecting lines */}
        <line x1="11" y1="24" x2="13.5" y2="24" stroke={accentColor} strokeWidth="1.5" />
        <line x1="18.5" y1="24" x2="21" y2="24" stroke={accentColor} strokeWidth="1.5" />
      </svg>
      {showWordmark && (
        <span
          className="font-bold tracking-tight"
          style={{
            fontSize: size * 0.65,
            color: variant === 'white' ? '#047857' : variant === 'emerald' ? '#064E3B' : '#0F172A',
          }}
        >
          TAVI
        </span>
      )}
    </span>
  );
}

export function TaviWordmark({
  color = '#064E3B',
  fontSize = 22,
}: {
  color?: string;
  fontSize?: number;
}) {
  return (
    <span
      className="font-bold tracking-tight"
      style={{ color, fontSize, lineHeight: 1 }}
    >
      TAVI
    </span>
  );
}
