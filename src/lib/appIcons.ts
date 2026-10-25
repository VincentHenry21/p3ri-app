/** Dynamic switchable app icons: SVG icon themes converted to data URLs
 * and pushed live into the favicon, apple-touch-icon, and web manifest
 * links, so the home-screen icon follows the user's choice or cycle phase. */

export type IconTheme = 'berry' | 'cloudy' | 'amber';

export const ICON_THEME_LABEL: Record<IconTheme, string> = {
  berry: 'Berry Flame',
  cloudy: 'Cloudy Peek',
  amber: 'Amber Luteal',
};

/** Phase to icon theme for the auto-switch option. */
export function iconThemeForPhase(phase: string): IconTheme {
  if (phase === 'menstrual') return 'berry';
  if (phase === 'luteal') return 'amber';
  return 'cloudy'; // follicular and ovulatory
}

function svgFor(theme: IconTheme): string {
  const grad = theme === 'berry'
    ? '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FF1E27"/><stop offset="55%" stop-color="#FF2E7E"/><stop offset="100%" stop-color="#FF62E6"/></linearGradient>'
    : theme === 'cloudy'
    ? '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2538FF"/><stop offset="55%" stop-color="#4659FF"/><stop offset="100%" stop-color="#6878FF"/></linearGradient>'
    : '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FF8C3B"/><stop offset="100%" stop-color="#F97316"/></linearGradient>';
  const buddy = theme === 'berry'
    // 3-peaked white flame/petal character with notched magenta eyes.
    ? '<path d="M60 22 C52 38 40 44 40 62 C40 78 49 92 60 92 C71 92 80 78 80 62 C80 44 68 38 60 22 Z" fill="#FFF5FB"/>'
      + '<path d="M60 30 C56 44 48 50 48 62 C48 74 53 84 60 84 C67 84 72 74 72 62 C72 50 64 44 60 30 Z" fill="#FFE4F1" opacity="0.7"/>'
      + '<circle cx="52" cy="62" r="5" fill="#FF2E7E"/><path d="M52 62 L58 59 L58 65 Z" fill="#FFF5FB"/>'
      + '<circle cx="68" cy="62" r="5" fill="#FF2E7E"/><path d="M68 62 L62 59 L62 65 Z" fill="#FFF5FB"/>'
    : theme === 'cloudy'
    // Royal-blue waves plus a white cloud buddy peeking bottom-right.
    ? '<path d="M0 78 Q30 62 60 78 T120 78 L120 120 L0 120 Z" fill="#7C8CFF" opacity="0.5"/>'
      + '<path d="M0 92 Q30 78 60 92 T120 92 L120 120 L0 120 Z" fill="#A5B4FC" opacity="0.45"/>'
      + '<circle cx="82" cy="86" r="18" fill="#fff"/><circle cx="98" cy="80" r="14" fill="#fff"/><circle cx="70" cy="92" r="12" fill="#fff"/><rect x="66" y="88" width="44" height="14" rx="7" fill="#fff"/>'
      + '<circle cx="84" cy="86" r="3.5" fill="#172554"/><circle cx="98" cy="86" r="3.5" fill="#172554"/>'
      + '<path d="M76 78 l1.5 3 3 1.5 -3 1.5 -1.5 3 -1.5 -3 -3 -1.5 3 -1.5 Z" fill="#fff"/>'
    // Amber: cozy sleeping plush silhouette with closed blinking eyes.
    : '<ellipse cx="60" cy="72" rx="30" ry="24" fill="#FFF7ED"/>'
      + '<path d="M46 66 Q50 62 54 66" fill="none" stroke="#9A3412" stroke-width="3" stroke-linecap="round"/>'
      + '<path d="M66 66 Q70 62 74 66" fill="none" stroke="#9A3412" stroke-width="3" stroke-linecap="round"/>'
      + '<ellipse cx="60" cy="80" rx="6" ry="4" fill="#FDBA74" opacity="0.8"/>';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">`
    + `<defs>${grad}</defs>`
    + `<rect x="2" y="2" width="116" height="116" rx="28" fill="url(#g)"/>`
    + `<rect x="6" y="6" width="108" height="108" rx="24" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="3"/>`
    + buddy
    + `</svg>`;
}

let lastManifestUrl: string | null = null;

/** Update favicon, apple-touch-icon, and manifest to the given theme. */
export function updateDynamicAppIcon(theme: IconTheme): void {
  try {
    const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgFor(theme))))}`;
    const fav = document.getElementById('dynamic-favicon') as HTMLLinkElement | null;
    if (fav) fav.href = dataUrl;
    const apple = document.getElementById('dynamic-apple-icon') as HTMLLinkElement | null;
    if (apple) apple.href = dataUrl;
    const manifest = {
      name: 'P3RI', short_name: 'P3RI', display: 'standalone',
      background_color: '#f8f7ff', theme_color: '#8B5CF6',
      icons: [{ src: dataUrl, sizes: '512x512', type: 'image/svg+xml', purpose: 'any' }],
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: 'application/json' }));
    const link = document.getElementById('dynamic-manifest') as HTMLLinkElement | null;
    if (link) link.href = url;
    if (lastManifestUrl) URL.revokeObjectURL(lastManifestUrl);
    lastManifestUrl = url;
  } catch {
    // Icon update is cosmetic: never break the app over it.
  }
}
