/**
 * Central P3RI icon library. Every icon is a custom inline SVG with soft
 * 3D gradients, duo-tone fills, rounded caps and specular highlights.
 * Zero Unicode emojis anywhere in the UI.
 */

const ROUND = { strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

/** Layered 3-tone flame: orange outer, amber middle, pale yellow core. */
export function FlameIcon({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M12 2c1.5 3.5-1 5.5-2.5 8A5.5 5.5 0 0 0 12 20a5.5 5.5 0 0 0 2.5-10c-.8 1.5-2 2-2.5 1.5C11 8.5 11 5 12 2z" fill="#F97316" />
      <path d="M12 8c.8 2-1 3.5-2 5.5A3.5 3.5 0 0 0 12 18a3.5 3.5 0 0 0 1.5-6.5C13 13 12.5 12 12 8z" fill="#FBBF24" />
      <path d="M12 13c.5 1.2-.6 2-1.2 3A2 2 0 0 0 12 18a2 2 0 0 0 .8-3.8C12.4 15 12.2 14 12 13z" fill="#FEF08A" />
    </svg>
  );
}

/** 5 bottom-nav icons, 24x24. Active: violet-to-pink gradient fill.
 * Inactive: 2px slate stroke with a 12% pastel inner fill. */
export function NavIcon({ tab, active }: { tab: 'home' | 'tracker' | 'health' | 'ask' | 'settings'; active: boolean }) {
  const gradId = `nav-grad-${tab}`;
  const stroke = active ? '#8B5CF6' : '#94A3B8';
  const fill = active ? `url(#${gradId})` : 'rgba(139,92,246,0.12)';
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', strokeWidth: 2, ...ROUND };
  const defs = (
    <defs>
      <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
    </defs>
  );
  if (tab === 'home') {
    return (
      <svg {...common} aria-hidden="true">
        {defs}
        <path d="M4 11.5 12 4l8 7.5" stroke={stroke} fill="none" />
        <path d="M6 10.5V20h12v-9.5" stroke={stroke} fill={fill} />
        <path d="M12 18.5c-2.2-1.6-3.5-2.8-3.5-4.4a1.9 1.9 0 0 1 3.5-1.1 1.9 1.9 0 0 1 3.5 1.1c0 1.6-1.3 2.8-3.5 4.4z" fill={active ? '#EC4899' : '#C4B5FD'} stroke="none" />
      </svg>
    );
  }
  if (tab === 'tracker') {
    return (
      <svg {...common} aria-hidden="true">
        {defs}
        <rect x="3.5" y="5" width="17" height="16" rx="5" stroke={stroke} fill={fill} />
        <circle cx="9" cy="4" r="1.4" stroke={stroke} fill="#fff" />
        <circle cx="15" cy="4" r="1.4" stroke={stroke} fill="#fff" />
        <path d="M7 16v-3M11 16V9M15 16v-5M19 16v-2" stroke={active ? '#fff' : stroke} strokeWidth="2.4" />
        <path d="M6 13c2-2 4 2 6 0s4 2 6 0" stroke={active ? '#EC4899' : '#C4B5FD'} strokeWidth="1.6" fill="none" />
      </svg>
    );
  }
  if (tab === 'health') {
    return (
      <svg {...common} aria-hidden="true">
        {defs}
        <path d="M12 20C7.5 16.5 4 13.5 4 9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5c0 2-1 3.5-2.5 5" stroke={stroke} fill={fill} />
        <path d="M7 13c0 3 2 5 5 5s5-2 5-5" stroke={stroke} fill="none" />
        <circle cx="17" cy="16.5" r="2.2" stroke={stroke} fill="#fff" />
        <path d="M20.5 3.5v3M19 5h3" stroke="#EC4899" strokeWidth="1.8" />
      </svg>
    );
  }
  if (tab === 'ask') {
    return (
      <svg {...common} aria-hidden="true">
        {defs}
        <path d="M20 12a8 8 0 0 1-8 8H5l-1.5 2L4 18a8 8 0 1 1 16-6z" stroke={stroke} fill={fill} />
        <path d="M9.5 10v4M14.5 10v4" stroke={active ? '#fff' : stroke} strokeWidth="2.6" />
        <path d="M19 2.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" fill="#EC4899" stroke="none" />
      </svg>
    );
  }
  return (
    <svg {...common} aria-hidden="true">
      {defs}
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse key={deg} cx="12" cy="6.2" rx="2.6" ry="3.4" stroke={stroke} fill={fill} transform={`rotate(${deg} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="3.2" fill={active ? `url(#${gradId})` : '#fff'} stroke={stroke} />
      <circle cx="12" cy="12" r="1.2" fill="#EC4899" stroke="none" />
    </svg>
  );
}

/** Glossy 3D rose-magenta droplet with a white specular arc. */
export function FlowDropIcon({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id="flow-drop-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF2E93" /><stop offset="100%" stopColor="#FF5E62" />
        </linearGradient>
      </defs>
      <path d="M16 3c4.5 5.8 8 10 8 15a8 8 0 1 1-16 0c0-5 3.5-9.2 8-15z" fill="url(#flow-drop-grad)" />
      <path d="M11 13c1-3 2.5-5.5 4-7.5" stroke="#fff" strokeWidth="2.2" fill="none" opacity="0.85" {...ROUND} />
      <ellipse cx="12.5" cy="20" rx="2.4" ry="1.4" fill="#fff" opacity="0.5" />
    </svg>
  );
}

/** Translucent sky-blue tumbler with a wavy liquid surface and bubbles. */
export function WaterGlassIcon({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id="water-glass-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38BDF8" /><stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>
      <path d="M9 4h14l-1.5 24a3 3 0 0 1-3 2.5h-5a3 3 0 0 1-3-2.5z" fill="#E0F2FE" opacity="0.65" stroke="#38BDF8" strokeWidth="1.6" {...ROUND} />
      <path d="M10.5 13c2-1.5 4 1.5 6 0s4 1.5 5.5 0l-.8 13.5a2.5 2.5 0 0 1-2.5 2.5h-5.4a2.5 2.5 0 0 1-2.5-2.5z" fill="url(#water-glass-grad)" opacity="0.9" />
      <circle cx="15" cy="20" r="1.6" fill="#fff" opacity="0.9" />
      <circle cx="19" cy="24" r="1.1" fill="#fff" opacity="0.8" />
      <path d="M10.5 13c2-1.5 4 1.5 6 0s4 1.5 5.5 0" stroke="#fff" strokeWidth="1.6" fill="none" {...ROUND} />
    </svg>
  );
}

/** Duo-tone emerald-mint dumbbell with motion sparkles. */
export function MovementIcon({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id="move-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10B981" /><stop offset="100%" stopColor="#34D399" />
        </linearGradient>
      </defs>
      <path d="M5 12v8M9 9v14M23 9v14M27 12v8" stroke="url(#move-grad)" strokeWidth="3.4" {...ROUND} />
      <path d="M9 16h14" stroke="#10B981" strokeWidth="3" {...ROUND} />
      <path d="M25 4l.6 1.5 1.5.6-1.5.6L25 8.2 24.4 6.7 22.9 6.1 24.4 5.5zM6 24l.5 1.2 1.2.5-1.2.5L6 27.4 5.5 26.2 4.3 25.7 5.5 25.2z" fill="#34D399" />
    </svg>
  );
}

/** Amber-gold crescent moon nestled behind a lavender cloud, two stars. */
export function SleepMoonIcon({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id="moon-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FBBF24" /><stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <path d="M20 4a11 11 0 1 0 8 19A13 13 0 0 1 20 4z" fill="url(#moon-grad)" />
      <path d="M21 5a9 9 0 0 1 5 14" stroke="#fff" strokeWidth="1.6" fill="none" opacity="0.7" {...ROUND} />
      <g fill="#C4B5FD">
        <ellipse cx="20" cy="24" rx="8" ry="4.5" />
        <circle cx="15" cy="21" r="3.4" /><circle cx="23" cy="20" r="3" />
      </g>
      <path d="M7 7l.6 1.5 1.5.6-1.5.6L7 11.2 6.4 9.7 4.9 9.1 6.4 8.5zM27 26l.5 1.2 1.2.5-1.2.5L27 29.4 26.5 28.2 25.3 27.7 26.5 27.2z" fill="#FDE68A" />
    </svg>
  );
}

/** Pastel violet fork and spoon crossed inside a soft lavender badge. */
export function NutritionIcon({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="#EDE9FE" />
      <path d="M11 5v7a2 2 0 0 0 4 0V5M11 8h4M13 14v13" stroke="#7C3AED" strokeWidth="2" fill="none" {...ROUND} />
      <path d="M21 5a3 3 0 0 1-3 3v6l-1 13" stroke="#A78BFA" strokeWidth="2" fill="none" {...ROUND} />
      <ellipse cx="19.5" cy="8" rx="2.6" ry="3.2" fill="#C4B5FD" />
    </svg>
  );
}
