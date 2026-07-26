export type StickerDefinition = {
  id: string;
  name: string;
  previewUrl: string;
  svgMarkup: string;
};

type StickerPalette = {
  shell: string;
  shellEdge: string;
  glow: string;
  labelBg: string;
  labelText: string;
  artPrimary: string;
  artSecondary: string;
};

const svgToDataUrl = (svg: string) => {
  const bytes = new TextEncoder().encode(svg);
  let binary = '';

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  const encoded = globalThis.btoa ? globalThis.btoa(binary) : '';
  return `data:image/svg+xml;base64,${encoded}`;
};

const artMap = {
  nice: (palette: StickerPalette) => `
    <circle cx="160" cy="136" r="54" fill="${palette.artSecondary}" fill-opacity="0.18"/>
    <circle cx="160" cy="136" r="48" fill="${palette.artSecondary}" fill-opacity="0.12" stroke="${palette.artSecondary}" stroke-opacity="0.35" stroke-width="6"/>
    <path d="M135 138L153 156L188 119" fill="none" stroke="${palette.artPrimary}" stroke-linecap="round" stroke-linejoin="round" stroke-width="18"/>
    <path d="M111 107L121 97" stroke="${palette.artSecondary}" stroke-linecap="round" stroke-width="8"/>
    <path d="M199 175L209 185" stroke="${palette.artSecondary}" stroke-linecap="round" stroke-width="8"/>
    <path d="M108 164L120 159" stroke="${palette.artSecondary}" stroke-linecap="round" stroke-width="8"/>
    <path d="M201 113L213 108" stroke="${palette.artSecondary}" stroke-linecap="round" stroke-width="8"/>
  `,
  party: (palette: StickerPalette) => `
    <path d="M121 168L186 103L213 130L148 195L121 168Z" fill="${palette.artPrimary}"/>
    <path d="M178 111L214 74L243 103L206 139L178 111Z" fill="${palette.artSecondary}"/>
    <path d="M123 170L96 196C89 203 89 214 96 221C103 228 114 228 121 221L148 195L123 170Z" fill="${palette.artSecondary}" fill-opacity="0.65"/>
    <circle cx="211" cy="78" r="8" fill="${palette.artPrimary}"/>
    <circle cx="230" cy="124" r="7" fill="${palette.labelText}"/>
    <circle cx="108" cy="105" r="7" fill="${palette.labelText}"/>
    <path d="M236 160L247 149" stroke="${palette.artPrimary}" stroke-linecap="round" stroke-width="8"/>
    <path d="M213 182L221 196" stroke="${palette.labelText}" stroke-linecap="round" stroke-width="8"/>
    <path d="M89 145L74 145" stroke="${palette.labelText}" stroke-linecap="round" stroke-width="8"/>
  `,
  fire: (palette: StickerPalette) => `
    <path d="M160 89C184 109 196 126 196 150C196 174 180 194 160 204C140 194 124 174 124 150C124 131 132 117 147 103C150 119 161 127 172 129C170 112 165 99 160 89Z" fill="${palette.artPrimary}"/>
    <path d="M160 120C171 131 177 142 177 154C177 168 169 179 160 184C151 179 143 168 143 154C143 144 147 136 154 128C155 137 160 142 166 143C165 136 163 127 160 120Z" fill="${palette.labelText}" fill-opacity="0.9"/>
    <path d="M121 196C132 184 145 178 160 178C175 178 188 184 199 196" fill="none" stroke="${palette.artSecondary}" stroke-linecap="round" stroke-width="10"/>
  `,
  laugh: (palette: StickerPalette) => `
    <circle cx="160" cy="138" r="56" fill="${palette.artSecondary}" fill-opacity="0.17" stroke="${palette.artSecondary}" stroke-opacity="0.35" stroke-width="6"/>
    <path d="M138 126C142 120 147 117 153 117C159 117 164 120 168 126" fill="none" stroke="${palette.artPrimary}" stroke-linecap="round" stroke-width="8"/>
    <path d="M152 126C156 120 161 117 167 117C173 117 178 120 182 126" fill="none" stroke="${palette.artPrimary}" stroke-linecap="round" stroke-width="8"/>
    <path d="M130 149C140 165 151 173 160 173C169 173 180 165 190 149" fill="${palette.artPrimary}"/>
    <path d="M141 151H179" stroke="${palette.labelText}" stroke-linecap="round" stroke-width="8"/>
    <path d="M121 102L109 90" stroke="${palette.artSecondary}" stroke-linecap="round" stroke-width="8"/>
    <path d="M199 186L211 198" stroke="${palette.artSecondary}" stroke-linecap="round" stroke-width="8"/>
  `,
  love: (palette: StickerPalette) => `
    <path d="M160 194L104 138C88 122 88 96 104 80C120 64 145 66 160 86C175 66 200 64 216 80C232 96 232 122 216 138L160 194Z" fill="${palette.artPrimary}"/>
    <path d="M160 170L120 130C109 119 109 101 120 90C131 79 147 81 160 97C173 81 189 79 200 90C211 101 211 119 200 130L160 170Z" fill="${palette.labelText}" fill-opacity="0.26"/>
    <path d="M101 177C115 189 131 196 160 196C189 196 205 189 219 177" fill="none" stroke="${palette.artSecondary}" stroke-linecap="round" stroke-width="10"/>
  `,
  wow: (palette: StickerPalette) => `
    <path d="M160 82L177 119L217 116L191 147L222 180L182 181L169 218L146 185L108 198L124 161L95 132L136 128L160 82Z" fill="${palette.artPrimary}"/>
    <circle cx="160" cy="146" r="20" fill="${palette.labelText}" fill-opacity="0.24"/>
    <circle cx="160" cy="146" r="10" fill="${palette.labelText}"/>
    <path d="M104 212C120 198 137 191 160 191C183 191 200 198 216 212" fill="none" stroke="${palette.artSecondary}" stroke-linecap="round" stroke-width="10"/>
  `
} satisfies Record<string, (palette: StickerPalette) => string>;

const buildSticker = (
  id: string,
  name: string,
  label: string,
  palette: StickerPalette,
  artKey: keyof typeof artMap
): StickerDefinition => {
  const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320" fill="none">
  <defs>
    <filter id="shadow-${id}" x="18" y="22" width="284" height="284" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="rgba(15,23,42,0.18)"/>
    </filter>
    <radialGradient id="glow-${id}" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(160 86) rotate(90) scale(166 166)">
      <stop offset="0" stop-color="${palette.glow}"/>
      <stop offset="1" stop-color="${palette.glow}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <g filter="url(#shadow-${id})">
    <path d="M72 42C84 30 101 24 118 24H216C250 24 278 52 278 86V188C278 234 240 272 194 272H122C94 272 72 250 72 222V42Z" fill="white"/>
    <path d="M252 24C266 24 278 36 278 50V67C278 78 269 87 258 87H244C234 87 226 79 226 69V50C226 36 238 24 252 24Z" fill="white"/>
    <path d="M78 46C89 35 103 30 118 30H213C245 30 271 56 271 88V188C271 230 236 264 194 264H124C99 264 78 243 78 218V46Z" fill="${palette.shell}"/>
    <path d="M247 30C260 30 271 41 271 54V71C271 81 263 89 253 89H240C231 89 223 81 223 72V54C223 41 234 30 247 30Z" fill="${palette.shell}"/>
    <path d="M88 60C98 50 111 45 125 45H205C230 45 250 65 250 90V186C250 219 223 246 190 246H130C107 246 88 227 88 204V60Z" fill="url(#glow-${id})"/>
    <path d="M78 46C89 35 103 30 118 30H213C245 30 271 56 271 88V188C271 230 236 264 194 264H124C99 264 78 243 78 218V46Z" stroke="${palette.shellEdge}" stroke-width="8"/>
    ${artMap[artKey](palette)}
    <rect x="94" y="212" width="132" height="34" rx="17" fill="${palette.labelBg}"/>
    <text x="160" y="234" text-anchor="middle" fill="${palette.labelText}" font-size="22" font-family="Arial, sans-serif" font-weight="700">${label}</text>
  </g>
</svg>`;

  return {
    id,
    name,
    svgMarkup,
    previewUrl: svgToDataUrl(svgMarkup)
  };
};

export const STICKER_PACK: StickerDefinition[] = [
  buildSticker(
    'thumbs-up',
    'Thumbs Up',
    'Nice',
    {
      shell: '#22c55e',
      shellEdge: '#16a34a',
      glow: '#bbf7d0',
      labelBg: 'rgba(255,255,255,0.2)',
      labelText: '#ffffff',
      artPrimary: '#ecfdf5',
      artSecondary: '#bbf7d0'
    },
    'nice'
  ),
  buildSticker(
    'party',
    'Party',
    'Party',
    {
      shell: '#f97316',
      shellEdge: '#ea580c',
      glow: '#fdba74',
      labelBg: 'rgba(255,255,255,0.22)',
      labelText: '#fff7ed',
      artPrimary: '#fff7ed',
      artSecondary: '#fed7aa'
    },
    'party'
  ),
  buildSticker(
    'fire',
    'Fire',
    'Hot',
    {
      shell: '#ef4444',
      shellEdge: '#dc2626',
      glow: '#fca5a5',
      labelBg: 'rgba(255,255,255,0.22)',
      labelText: '#fff1f2',
      artPrimary: '#fff7ed',
      artSecondary: '#fecaca'
    },
    'fire'
  ),
  buildSticker(
    'laugh',
    'Laugh',
    'LOL',
    {
      shell: '#06b6d4',
      shellEdge: '#0891b2',
      glow: '#67e8f9',
      labelBg: 'rgba(255,255,255,0.22)',
      labelText: '#ecfeff',
      artPrimary: '#083344',
      artSecondary: '#cffafe'
    },
    'laugh'
  ),
  buildSticker(
    'love',
    'Love',
    'Love',
    {
      shell: '#ec4899',
      shellEdge: '#db2777',
      glow: '#f9a8d4',
      labelBg: 'rgba(255,255,255,0.22)',
      labelText: '#fff1f2',
      artPrimary: '#fff1f2',
      artSecondary: '#fbcfe8'
    },
    'love'
  ),
  buildSticker(
    'mind-blown',
    'Mind Blown',
    'Wow',
    {
      shell: '#8b5cf6',
      shellEdge: '#7c3aed',
      glow: '#c4b5fd',
      labelBg: 'rgba(255,255,255,0.22)',
      labelText: '#f5f3ff',
      artPrimary: '#ede9fe',
      artSecondary: '#ddd6fe'
    },
    'wow'
  )
];

export const createStickerFile = (sticker: StickerDefinition) =>
  new File([sticker.svgMarkup], `${sticker.id}.svg`, {
    type: 'image/svg+xml'
  });
