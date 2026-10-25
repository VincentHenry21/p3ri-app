/**
 * 12 bespoke Jelly Cloud sticker badges, viewBox 0 0 64 64.
 * Scalloped translucent dark-violet cloud silhouette (#2E1065) with a
 * glowing #A78BFA rim, a blurred neon inner aura, and vector eyes/props.
 * Zero emojis: every face is drawn, not typed.
 */

export type StickerId =
  | 'starry' | 'cookie' | 'wink' | 'dizzy' | 'sleepy' | 'sparkle'
  | 'reader' | 'puddle' | 'loved' | 'calm' | 'fog' | 'sensitive';

function CloudShell({ aura, children }: { aura: string; children?: React.ReactNode }) {
  return (
    <g>
      <defs>
        <filter id="sticker-blur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
      </defs>
      <circle cx="32" cy="32" r="17" fill={aura} filter="url(#sticker-blur)" opacity="0.9" />
      <g fill="#2E1065" fillOpacity="0.94" stroke="#A78BFA" strokeWidth="1.8" strokeLinejoin="round">
        <circle cx="22" cy="34" r="10" />
        <circle cx="32" cy="26" r="12" />
        <circle cx="42" cy="34" r="10" />
        <path d="M18 42h28a5 5 0 0 0 5-5c0-1-.3-2-.8-2.8C48 42 44 46 32 46S16 42 13.8 34.2A5 5 0 0 0 18 42z" />
      </g>
      {children}
    </g>
  );
}

const pillEyes = (color = '#fff') => (
  <g fill={color}>
    <rect x="23" y="29" width="4" height="11" rx="2" />
    <rect x="37" y="29" width="4" height="11" rx="2" />
  </g>
);

const star = (cx: number, cy: number, r: number, fill: string) => (
  <path d={`M${cx} ${cy - r}l${r * 0.3} ${r * 0.75} ${r * 0.8} ${r * 0.1} -${r * 0.65} ${r * 0.5} ${r * 0.25} ${r * 0.8} -${r * 0.8} -${r * 0.55} ${r * 0.25} -${r * 0.8} -${r * 0.65} -${r * 0.5} ${r * 0.8} -${r * 0.1}z`} fill={fill} />
);

export default function JellySticker({ id, size = 48 }: { id: StickerId; size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} role="img" aria-label={`${id} sticker`} style={{ overflow: 'visible', display: 'block' }}>
      {id === 'starry' && (
        <CloudShell aura="#FBBF24">
          {star(32, 22, 7, '#FBBF24')}
          {pillEyes()}
          <path d="M27 46q5 4 10 0" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </CloudShell>
      )}
      {id === 'cookie' && (
        <CloudShell aura="#F59E0B">
          <circle cx="38" cy="42" r="9" fill="#D97706" />
          <circle cx="44" cy="36" r="4.5" fill="#2E1065" />
          <circle cx="36" cy="40" r="1.4" fill="#451A03" /><circle cx="41" cy="44" r="1.4" fill="#451A03" /><circle cx="33" cy="44" r="1.2" fill="#451A03" />
          {pillEyes()}
        </CloudShell>
      )}
      {id === 'wink' && (
        <CloudShell aura="#F9A8D4">
          <circle cx="32" cy="28" r="13" fill="#F9A8D4" opacity="0.35" />
          <rect x="23" y="29" width="4" height="11" rx="2" fill="#fff" />
          <path d="M37 30l8 5-8 5" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M27 46q5 4 10 0" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </CloudShell>
      )}
      {id === 'dizzy' && (
        <CloudShell aura="#22D3EE">
          <path d="M34 16l-6 9h4l-3 8 7-10h-4z" fill="#22D3EE" />
          <g stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round">
            <path d="M22 34a4 4 0 1 1 4 4M22 34a4 4 0 1 0 4-4" />
            <path d="M38 34a4 4 0 1 1 4 4M38 34a4 4 0 1 0 4-4" />
          </g>
        </CloudShell>
      )}
      {id === 'sleepy' && (
        <CloudShell aura="#6366F1">
          <path d="M25 32q3 4 6 0M39 32q3 4 6 0" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <text x="46" y="20" fontSize="11" fill="#C4B5FD" fontWeight="800" fontFamily="sans-serif">Z</text>
          <text x="52" y="13" fontSize="8" fill="#C4B5FD" fontWeight="800" fontFamily="sans-serif">Z</text>
        </CloudShell>
      )}
      {id === 'sparkle' && (
        <CloudShell aura="#FB923C">
          {star(32, 20, 8, '#FB923C')}
          <ellipse cx="25" cy="35" rx="3" ry="7" fill="#fff" />
          <ellipse cx="39" cy="35" rx="3" ry="7" fill="#fff" />
          <path d="M28 47q4 3 8 0" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </CloudShell>
      )}
      {id === 'reader' && (
        <CloudShell aura="#C4B5FD">
          {pillEyes()}
          <path d="M22 44q5-4 10 0 5-4 10 0v8q-5-4-10 0-5-4-10 0z" fill="#EDE9FE" stroke="#A78BFA" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M32 44v8" stroke="#A78BFA" strokeWidth="1.4" />
        </CloudShell>
      )}
      {id === 'puddle' && (
        <g>
          <ellipse cx="32" cy="46" rx="24" ry="9" fill="#2E1065" fillOpacity="0.94" stroke="#A78BFA" strokeWidth="1.8" />
          <ellipse cx="32" cy="42" rx="16" ry="5" fill="#2E1065" fillOpacity="0.94" />
          <path d="M22 38q3 3 6 0M36 38q3 3 6 0" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="32" cy="30" r="9" fill="#7C3AED" opacity="0.35" filter="url(#sticker-blur)" />
        </g>
      )}
      {id === 'loved' && (
        <CloudShell aura="#FF2E93">
          <path d="M32 30c-4-4-10-2-10 2.5C22 37 27 40 32 43c5-3 10-6 10-10.5C42 28 36 26 32 30z" fill="#FF2E93" />
          <path d="M24 36l5-3M40 36l-5-3" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </CloudShell>
      )}
      {id === 'calm' && (
        <CloudShell aura="#6EE7B7">
          <path d="M24 35q3-3 6 0M34 35q3-3 6 0" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M28 46q4 3 8 0" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </CloudShell>
      )}
      {id === 'fog' && (
        <CloudShell aura="#94A3B8">
          <ellipse cx="20" cy="26" rx="8" ry="4" fill="#CBD5E1" opacity="0.8" />
          <ellipse cx="44" cy="30" rx="8" ry="4" fill="#CBD5E1" opacity="0.8" />
          <ellipse cx="32" cy="22" rx="7" ry="3.5" fill="#E2E8F0" opacity="0.8" />
          {pillEyes('#E2E8F0')}
        </CloudShell>
      )}
      {id === 'sensitive' && (
        <CloudShell aura="#FDA4AF">
          <ellipse cx="21" cy="41" rx="4" ry="2.6" fill="#FDA4AF" />
          <ellipse cx="43" cy="41" rx="4" ry="2.6" fill="#FDA4AF" />
          <circle cx="25" cy="34" r="4.5" fill="#fff" /><circle cx="39" cy="34" r="4.5" fill="#fff" />
          <circle cx="25" cy="35" r="2.2" fill="#172554" /><circle cx="39" cy="35" r="2.2" fill="#172554" />
          <circle cx="26" cy="33" r="0.9" fill="#fff" /><circle cx="40" cy="33" r="0.9" fill="#fff" />
          <path d="M46 40c1.5 2 0 3.5-1 4.5-.8-1-1-2.5 1-4.5z" fill="#93C5FD" />
        </CloudShell>
      )}
    </svg>
  );
}
