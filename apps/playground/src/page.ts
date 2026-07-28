/**
 * Playground page builder.
 *
 * The single most valuable thing this can do is show every avatar at 16px next to its large version.
 * The style has to survive `agent-picker`'s 16px slot, and a preview that only renders at a comfortable
 * size will hide that failure until it reaches production.
 *
 * Rendering happens here as plain strings — no framework, no build step. The output is equally usable
 * from a dev server and from a static export.
 */

import { createAvatar, styleDefinition } from 'lexavataaars'

/** The sizes the avatar actually appears at in CODEXIS, smallest first. */
export const REVIEW_SIZES = [16, 24, 32, 64] as const

/** Realistic legal-agent names, so the review looks at the seeds the style will really see. */
const SEEDS = [
  'Právní poradce',
  'Právní koncipient',
  'Judikaturní rešeršer',
  'Expert na obecní samosprávu',
  'Daňový specialista',
  'Korporátní právník',
  'Rešerše sbírky zákonů',
  'Smluvní analytik',
  'Compliance officer',
  'Insolvenční správce',
  'Veřejné zakázky',
  'Pracovní právo',
]

function svg(seed: string, size: number, options: Record<string, unknown> = {}): string {
  return createAvatar({ seed, size, ...options }).toString()
}

function variantsOf(component: string): string[] {
  const components = (styleDefinition as { components?: Record<string, { variants?: object }> }).components
  return Object.keys(components?.[component]?.variants ?? {})
}

function fieldColors(): string[] {
  const colors = (styleDefinition as { colors?: Record<string, { values: string[] }> }).colors
  return colors?.field?.values ?? []
}

function componentNames(): string[] {
  const components = (styleDefinition as { components?: Record<string, unknown> }).components
  return Object.keys(components ?? {})
}

/** The two components with the most variants — in practice the ones carrying the identity. */
function largestComponents(): [string, string] {
  const components = (styleDefinition as { components?: Record<string, { variants?: object }> }).components ?? {}
  const ranked = Object.entries(components)
    .map(([name, value]) => [name, Object.keys(value.variants ?? {}).length] as const)
    .sort((a, b) => b[1] - a[1])
  return [ranked[0]?.[0] ?? '', ranked[1]?.[0] ?? '']
}

function sizeLadder(seed: string): string {
  const cells = REVIEW_SIZES.map(
    (size) => `<div class="cell"><div class="art">${svg(seed, size)}</div><span>${size}</span></div>`,
  ).join('')
  return `<div class="ladder"><div class="label">${escapeHtml(seed)}</div><div class="row">${cells}</div></div>`
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (char) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot' }[char]};`)
}

export function renderPage(): string {
  const ladders = SEEDS.map(sizeLadder).join('')

  // Pinning variants isolates one part at a time. This is the same mechanism a consumer would use to
  // build a preset, so the review surface and the public API exercise the same path.
  const parts = componentNames()
    .flatMap((component) =>
      variantsOf(component).map((variant) => {
        const art = REVIEW_SIZES.map(
          (size) =>
            `<div class="cell"><div class="art">${svg('preview', size, { [`${component}Variant`]: variant })}</div><span>${size}</span></div>`,
        ).join('')
        return `<div class="ladder"><div class="label">${component} · ${variant}</div><div class="row">${art}</div></div>`
      }),
    )
    .join('')

  // The combination that actually carries identity at a glance: profile against headwear.
  // The two components that carry most of the identity, crossed against each other. Picking them from
  // the definition rather than naming them keeps this working when the style changes underneath.
  const [rowPart, colPart] = largestComponents()
  const matrix = variantsOf(rowPart)
    .map((row) => {
      const cells = variantsOf(colPart)
        .map(
          (col) =>
            `<div class="cell"><div class="art">${svg(`${row}-${col}`, 56, { [`${rowPart}Variant`]: row, [`${colPart}Variant`]: col })}</div><span>${col}</span></div>`,
        )
        .join('')
      return `<div class="ladder"><div class="label">${rowPart} · ${row}</div><div class="row">${cells}</div></div>`
    })
    .join('')

  // Every field colour against the contrast-selected motif colour, to confirm the style holds up on
  // light and dark alike.
  const palette = fieldColors()
    .map((color) => {
      const art = svg('palette', 64, { fieldColor: color })
      return `<div class="swatch"><div class="art">${art}</div><code>${color}</code></div>`
    })
    .join('')

  const wall = SEEDS.concat(
    Array.from({ length: 36 }, (_, index) => `agent-${index}`),
  )
    .map((seed) => `<div class="tile" title="${escapeHtml(seed)}">${svg(seed, 40)}</div>`)
    .join('')

  return `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>lexavataaars — playground</title>
<style>
  :root { color-scheme: light dark; --bg: #faf8f4; --fg: #1c1b19; --muted: #6b6862; --line: #e0dad0; }
  @media (prefers-color-scheme: dark) { :root { --bg: #141311; --fg: #ece7dd; --muted: #918c83; --line: #2b2925; } }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 40px 32px 80px; background: var(--bg); color: var(--fg);
         font: 14px/1.5 ui-sans-serif, -apple-system, "Segoe UI", sans-serif; }
  h1 { font-size: 20px; font-weight: 600; margin: 0 0 4px; letter-spacing: -0.01em; }
  .sub { color: var(--muted); margin: 0 0 40px; }
  h2 { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;
       color: var(--muted); margin: 48px 0 16px; padding-bottom: 8px; border-bottom: 1px solid var(--line); }
  .ladders { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px 32px; }
  .ladder { min-width: 0; }
  .label { color: var(--muted); font-size: 12px; margin-bottom: 8px; white-space: nowrap;
           overflow: hidden; text-overflow: ellipsis; }
  .row { display: flex; align-items: flex-end; gap: 16px; }
  .cell { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .cell span { font-size: 10px; color: var(--muted); font-variant-numeric: tabular-nums; }
  .art svg { display: block; border-radius: 6px; }
  .wall { display: grid; grid-template-columns: repeat(auto-fill, 40px); gap: 12px; }
  .tile svg { display: block; border-radius: 8px; }
  .palette { display: flex; flex-wrap: wrap; gap: 20px; }
  .swatch { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .swatch code { font-size: 11px; color: var(--muted); }
  .swatch svg { border-radius: 10px; }
</style>
</head>
<body>
  <h1>lexavataaars</h1>
  <p class="sub">Každý avatar ve všech velikostech, ve kterých se v produktu vyskytuje. 16&nbsp;px vlevo je ten, na kterém návrh stojí nebo padá.</p>

  <h2>Velikostní žebřík · reálné názvy agentů</h2>
  <div class="ladders">${ladders}</div>

  <h2>Matice dvou nejbohatších komponent</h2>
  <div class="ladders">${matrix}</div>

  <h2>Části izolovaně</h2>
  <div class="ladders">${parts}</div>

  <h2>Paleta podkladu · kontrast motivu</h2>
  <div class="palette">${palette}</div>

  <h2>Stěna · rozmanitost napříč seedy</h2>
  <div class="wall">${wall}</div>
</body>
</html>`
}
