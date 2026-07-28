/**
 * Builds `docs/`, the GitHub Pages site.
 *
 * The page has one job: show what the style actually renders. So every avatar on it is generated here,
 * at build time, by calling the published package's own entry point — the same `createAvatar` a consumer
 * imports — and the resulting SVG is inlined into the HTML. Nothing is fetched at view time: no CDN, no
 * npm, no webfont, no analytics. GitHub Pages serves the file and the browser makes no other request.
 *
 * The wardrobe, the colour groups and the variant lists are all read out of the generated definition
 * rather than typed here, so the page cannot drift from the style: regenerate the definition, re-run
 * this, and the site follows.
 *
 * Run: bun run scripts/build-site.ts
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createAvatar, styleDefinition } from '../packages/core/src/index.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'docs')

const PKG = 'lexavataaars'
const REPO = 'https://github.com/ThePatriczek/lexavataaars'
const NPM = 'https://www.npmjs.com/package/lexavataaars'

type Options = Parameters<typeof createAvatar>[0]

/**
 * One avatar, as inline SVG.
 *
 * DiceBear stamps ~900 bytes of RDF provenance into every render. That is right for a file on disk and
 * wrong for a page carrying a hundred of them, where it is a fifth of the weight for something no reader
 * or crawler sees; the provenance this page owes is stated in prose at the bottom instead. Nothing else
 * is touched — the geometry is exactly what the package emits.
 */
/**
 * Counts avatars so their internal ids can be made unique without being random.
 *
 * `idRandomization` cannot simply be turned off here: ninety avatars in one document would then share
 * gradient and mask ids, and the later ones would silently repaint the earlier ones. That is the bug the
 * option exists to prevent. But leaving it on makes the build nondeterministic — `docs/index.html` shows
 * a diff on every regeneration even when no artwork moved, which makes "is the published site stale?"
 * unanswerable from `git status`, and that is the whole reason the file is committed.
 *
 * So: keep the randomisation, then rewrite each avatar's ids to a counter. Unique across the page,
 * identical across builds.
 */
let avatarSeq = 0

function avatar(options: Options): string {
  const svg = createAvatar(options)
    .toString()
    .replace(/<metadata[\s\S]*?<\/metadata>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')

  const n = avatarSeq++
  let idSeq = 0

  // Rewrite only strings that appear as an `id="…"`, and rewrite every reference to them by exact
  // match. A blind regex over the whole document would risk chewing into path data.
  return [...new Set(svg.match(/id="([^"]+)"/g) ?? [])]
    .map((attr) => attr.slice(4, -1))
    .reduce((out, id) => out.replaceAll(id, `a${n}-${idSeq++}`), svg)
}

/** Escapes text for HTML body context. */
function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** A fenced code block. Long lines scroll inside it rather than widening the page. */
function code(source: string): string {
  return `<pre><code>${esc(source.trim())}</code></pre>`
}

/**
 * Seeds for the hero wall.
 *
 * Real names from a wide spread of naming traditions, because that is what a directory of practitioners
 * looks like and because the seed→appearance mapping is only interesting if the input is plausible. They
 * are ordinary names, not the names of real judges — nothing here should read as a claim about a person.
 */
const WALL_SEEDS = [
  'Amara Osei',
  'Tomáš Havel',
  'Eleanor Whitfield',
  'Rafael Duarte',
  'Ingrid Sørensen',
  'Kwame Mensah',
  'Marta Kowalczyk',
  'Hiroshi Tanaka',
  'Sofia Marchetti',
  'Dermot Ó Braonáin',
  'Aisha Rahman',
  'Lucas Bergström',
  'Camille Fournier',
  'Andrei Popescu',
  'Nadia Haddad',
  'Grace Achebe',
  'Jonas Meier',
  'Petra Novotná',
  'Ravi Chandrasekhar',
  'Beatriz Salazar',
  'Sean Mac Giolla',
  'Yara Nasser',
  'Klaus Bergmann',
  'Miriam Fischer',
  'Olusegun Adeyemi',
  'Hannah Lindqvist',
  'Viktor Ilyin',
  'Chiara Ferraro',
  'Daniel Okonkwo',
  'Élodie Rousseau',
  'Stefan Vukovic',
  'Priya Nair',
  'Margaret Coyle',
  'Anton Weiss',
  'Leila Farsi',
  'Zoltán Balogh',
  'Rosa Iglesias',
  'Emeka Nwosu',
  'Astrid Halvorsen',
  'Julien Lemaire',
  'Karin Steiner',
  'Mateo Reyes',
  'Freya Donnelly',
  'Ismail Yilmaz',
  'Louise Ashcroft',
  'Peter Svoboda',
  'Naomi Katz',
  'Bruno Almeida',
]

/**
 * The wardrobe, in the order the derivation runs: shirt, then things added to it, then the coats, then
 * court and academic dress. Names come from the definition; the sentence beside each is the reason the
 * garment is in the style rather than a description of its pixels.
 */
const WARDROBE: Record<string, string> = {
  shirtAndTie: 'Collar, band and four-in-hand. The base every other business garment is built on.',
  shirtAndBowTie: 'The same shirt with a bow at the throat notch, for the older end of the bar.',
  suit: 'Jacket worn closed over the shirt and tie — the default of the profession.',
  suitAndWaistcoat: 'Three pieces. The waistcoat is cut out of the torso, so its outline is the body’s.',
  suitAndBowTie: 'Full formal day dress, still business rather than court.',
  suitAndCravat: 'A folded neckcloth filling the collar rather than hanging from it — broad where a tie is narrow.',
  waistcoatAndTie: 'Jacket off. What chambers looks like in July.',
  waistcoatAndBowTie: 'The same, formal at the neck.',
  doubleBreastedSuit: 'Left front carried across the chest and under the right lapel, as a real coat wraps.',
  blazer: 'Worn open over the shirt. The one garment inherited from upstream unchanged.',
  gown: 'Court and academic dress: the jacket with its lapels replaced by silk facings and its fronts swung out.',
  gownAndBands: 'The gown with barrister’s bands at the throat — the most legible legal silhouette in the set.',
  gownAndHood: 'The academic gown with a hood, the one place the accent colour lands on a robe.',
}

/** A wardrobe entry renders on a seed that suits it, so the figure is not fighting the garment. */
const WARDROBE_SEEDS = [
  'Eleanor Whitfield',
  'Kwame Mensah',
  'Petra Novotná',
  'Anton Weiss',
  'Sofia Marchetti',
  'Ravi Chandrasekhar',
  'Margaret Coyle',
  'Jonas Meier',
  'Beatriz Salazar',
  'Aisha Rahman',
  'Dermot Ó Braonáin',
  'Ingrid Sørensen',
  'Camille Fournier',
  'Klaus Bergmann',
]

/** One line per colour group: what it dresses, and therefore when a consumer would pin it. */
const COLOR_NOTES: Record<string, string> = {
  skin: 'Five tones, the source’s own range minus its two cartoon values.',
  hair: 'Eight values, constrained never to equal the skin beneath them.',
  facialHair: 'The hair list, adjusted where a beard sat on skin too close to it.',
  clothes: 'Suiting. Eight dark values — at 16px the torso is the style’s loudest statement.',
  robe: 'Court and academic dress. Three near-blacks so the gown is not flat.',
  facing: 'Silk facings on a gown, always lighter than the robe they sit on.',
  shirt: 'Linen, greyed on purpose so a white torso survives a white page.',
  accent: 'The one saturated note, on exactly one element at a time: the tie, the bow, the hood.',
  wig: 'Horsehair. Never taken from `hair`, or a third of the wigs come out ginger.',
  accessories: 'Spectacle frames: metal, horn, tortoise.',
  hat: 'The biretta. Cool darks only.',
}

const colorGroups = Object.keys(styleDefinition.colors ?? {})
const componentNames = Object.keys(styleDefinition.components ?? {})

/** The palette a group offers, as read from the generated definition. */
function paletteOf(group: string): string[] {
  const colors = (styleDefinition.colors ?? {}) as Record<string, { values?: string[] }>
  return colors[group]?.values ?? []
}

/** Variants a component offers, as read from the generated definition. */
function variantsOf(component: string): string[] {
  const components = (styleDefinition.components ?? {}) as Record<
    string,
    { variants?: Record<string, unknown> }
  >
  return Object.keys(components[component]?.variants ?? {})
}

const wall = WALL_SEEDS.map(
  (seed) => `<figure class="cell"><div class="face">${avatar({ seed, size: 96 })}</div></figure>`,
).join('')

/*
 * The page is only as honest as this check makes it.
 *
 * `WARDROBE` is iterated to build the wardrobe section, so a garment cut from the artwork stayed on the
 * page with a working caption and a rendered figure until someone happened to notice — which is exactly
 * the drift a generated site exists to prevent. `gownAndJabot` survived one such cut that way. Comparing
 * the two lists costs nothing and turns a silent wrong page into a failed build.
 */
const definedClothes = variantsOf('clothes')
const wardrobeNames = Object.keys(WARDROBE)
const missingNote = definedClothes.filter((v) => !wardrobeNames.includes(v))
const staleNote = wardrobeNames.filter((v) => !definedClothes.includes(v))
if (missingNote.length || staleNote.length) {
  throw new Error(
    `build-site: WARDROBE is out of step with the definition.` +
      (missingNote.length ? ` Missing a note for: ${missingNote.join(', ')}.` : '') +
      (staleNote.length ? ` Note for a variant that no longer exists: ${staleNote.join(', ')}.` : ''),
  )
}

const wardrobe = Object.entries(WARDROBE)
  .map(([variant, note], i) => {
    const seed = WARDROBE_SEEDS[i % WARDROBE_SEEDS.length] ?? variant
    const svg = avatar({ seed, size: 112, clothesVariant: [variant] } as Options)
    return `<figure class="garment">
      <div class="face">${svg}</div>
      <figcaption><code>${esc(variant)}</code><span>${note}</span></figcaption>
    </figure>`
  })
  .join('')

const swatches = colorGroups
  .map((group) => {
    const values = paletteOf(group)
      .map((v) => `<i style="--c:${esc(v)}" title="${esc(v)}"></i>`)
      .join('')
    return `<tr>
      <th scope="row"><code>${esc(group)}Color</code></th>
      <td><div class="swatches">${values}</div></td>
      <td>${COLOR_NOTES[group] ?? ''}</td>
    </tr>`
  })
  .join('')

/** Recolouring, shown rather than asserted: one seed, five different sets of pinned colours. */
const RECOLOURS: Array<{ label: string; options: Record<string, unknown> }> = [
  // Same seed and same garment throughout, so the only thing that moves between chips is the option named
  // under it. Letting the first one keep its own garment made it look like the options changed the cut.
  { label: 'unpinned', options: { clothesVariant: ['suit'] } },
  { label: 'clothesColor', options: { clothesColor: ['1c1c1e'], clothesVariant: ['suit'] } },
  {
    label: 'accentColor',
    options: { accentColor: ['1f4c63'], clothesVariant: ['suit'] },
  },
  {
    label: 'shirtColor',
    options: { shirtColor: ['d5dbe2'], clothesVariant: ['suit'] },
  },
  {
    label: 'accentColorFill: linear',
    options: {
      clothesVariant: ['suit'],
      accentColor: ['7c2529'],
      accentColorFill: ['linear'],
      accentColorAngle: [45],
    },
  },
]

const recolours = RECOLOURS.map(
  ({ label, options }) => `<figure class="chip">
    <div class="face">${avatar({ seed: 'Eleanor Whitfield', size: 88, ...options } as Options)}</div>
    <figcaption><code>${esc(label)}</code></figcaption>
  </figure>`,
).join('')

const SIZES = [16, 20, 24, 32, 48, 64, 96, 128]

const ladderBare = SIZES.map(
  (size) => `<figure class="rung">
    <div class="face" style="--s:${size}px">${avatar({ seed: 'Kwame Mensah', size })}</div>
    <figcaption>${size}</figcaption>
  </figure>`,
).join('')

const ladderBacked = SIZES.map(
  (size) => `<figure class="rung">
    <div class="face" style="--s:${size}px">${avatar({
      seed: 'Kwame Mensah',
      size,
      backgroundColor: ['e8e3d9'],
      borderRadius: 50,
    } as Options)}</div>
    <figcaption>${size}</figcaption>
  </figure>`,
).join('')

const variantTable = componentNames
  .map(
    (name) => `<tr>
      <th scope="row"><code>${esc(name)}Variant</code></th>
      <td><code class="wrap">${variantsOf(name).map(esc).join(' ')}</code></td>
    </tr>`,
  )
  .join('')

/**
 * The tab icon, as a data URI rather than a file.
 *
 * It is an avatar of the package's own name — the style describing itself — and inlining it keeps the
 * page's claim of zero external requests true for the favicon too, which is otherwise the one request a
 * static page makes without being asked.
 */
const FAVICON = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  avatar({
    seed: 'lexavataaars',
    size: 64,
    backgroundColor: ['e8e3d9'],
    borderRadius: 50,
  } as Options),
)}`

const CSS = `
:root {
  color-scheme: light dark;
  --paper: #f4f1ea;
  --surface: #fbf9f5;
  --ink: #1c1c1e;
  --muted: #5f5a52;
  --rule: #ddd6c8;
  --accent: #7c2529;
  --code-bg: #eae5da;
  --serif: ui-serif, Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif;
  --sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
}
@media (prefers-color-scheme: dark) {
  :root {
    --paper: #16161a;
    --surface: #1d1d21;
    --ink: #e4e1d9;
    --muted: #9b958a;
    --rule: #2e2d31;
    --accent: #c07a7d;
    --code-bg: #232328;
  }
}
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font: 400 17px/1.65 var(--serif);
  overflow-x: hidden;
}
.page { max-width: 1120px; margin: 0 auto; padding: 0 clamp(16px, 4vw, 40px) 96px; }
.prose { max-width: 68ch; }
h1, h2, h3 { font-weight: 600; line-height: 1.2; letter-spacing: -0.01em; }
h1 { font-size: clamp(34px, 7vw, 52px); margin: 0 0 12px; }
h2 { font-size: clamp(22px, 3.4vw, 27px); margin: 0 0 8px; }
h3 { font-size: 17px; margin: 32px 0 8px; font-family: var(--sans); letter-spacing: 0.01em; }
p { margin: 0 0 16px; }
a { color: var(--accent); text-underline-offset: 2px; }
code { font-family: var(--mono); font-size: 0.87em; }
:not(pre) > code { background: var(--code-bg); padding: 0.12em 0.36em; border-radius: 3px; }
pre {
  background: var(--code-bg);
  border: 1px solid var(--rule);
  border-radius: 4px;
  padding: 16px;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 20px;
}
pre code { background: none; padding: 0; }

header.masthead { padding: clamp(48px, 9vw, 96px) 0 8px; }
.eyebrow {
  font: 600 12px/1 var(--sans);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
  margin: 0 0 20px;
}
.lede { font-size: clamp(19px, 2.4vw, 22px); color: var(--ink); max-width: 60ch; }
.meta {
  font: 400 14px/1.7 var(--sans);
  color: var(--muted);
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
  margin-top: 24px;
}

section { margin-top: clamp(56px, 8vw, 88px); }
section > h2 { border-top: 1px solid var(--rule); padding-top: 20px; }
.note { font: 400 15px/1.6 var(--sans); color: var(--muted); max-width: 68ch; }

.wall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  gap: clamp(8px, 1.6vw, 18px);
  margin-top: 28px;
}
.cell { margin: 0; }
.face svg { display: block; width: 100%; height: auto; }
.cell .face {
  background: var(--surface);
  border: 1px solid var(--rule);
  border-radius: 3px;
  overflow: hidden;
}

.rack {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 24px;
  margin-top: 28px;
}
.garment { margin: 0; display: flex; gap: 14px; align-items: flex-start; }
.garment .face {
  flex: 0 0 84px;
  background: var(--surface);
  border: 1px solid var(--rule);
  border-radius: 3px;
  overflow: hidden;
}
.garment figcaption { font: 400 14px/1.5 var(--sans); color: var(--muted); }
.garment figcaption code { display: block; color: var(--ink); margin-bottom: 4px; background: none; padding: 0; }

.strip { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 28px; align-items: flex-end; }
.chip { margin: 0; width: 96px; }
.chip .face { background: var(--surface); border: 1px solid var(--rule); border-radius: 3px; overflow: hidden; }
.chip figcaption { font: 400 12px/1.4 var(--sans); color: var(--muted); margin-top: 8px; word-break: break-word; }

.ladder { display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-end; margin-top: 24px; }
.rung { margin: 0; text-align: center; }
.rung .face { width: var(--s); }
.rung .face svg { width: var(--s); height: var(--s); }
.rung figcaption { font: 400 11px/1 var(--sans); color: var(--muted); margin-top: 8px; }

.scroller { overflow-x: auto; margin: 24px 0; border: 1px solid var(--rule); border-radius: 4px; }
/* Wide content scrolls inside .scroller rather than being crushed: on a phone a three-column table
   squeezed to 390px wraps every cell onto four lines and stops being a table. */
table { border-collapse: collapse; width: 100%; min-width: 520px; font: 400 15px/1.5 var(--sans); }
th, td { text-align: left; padding: 10px 14px; border-bottom: 1px solid var(--rule); vertical-align: top; }
tr:last-child th, tr:last-child td { border-bottom: 0; }
th { font-weight: 600; white-space: nowrap; }
td { color: var(--muted); }
/* The swatches live in a div inside the cell: a flex td stops being a table cell and takes its own
   row's border with it. */
.swatches { display: flex; flex-wrap: wrap; gap: 4px; max-width: 200px; }
.swatches i { width: 18px; height: 18px; border-radius: 2px; background: var(--c); border: 1px solid rgb(128 128 128 / 0.35); }
.wrap { white-space: normal; word-break: break-word; }

footer { margin-top: clamp(64px, 9vw, 96px); border-top: 1px solid var(--rule); padding-top: 24px; }
footer p { font: 400 15px/1.7 var(--sans); color: var(--muted); max-width: 68ch; }
`

const HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>lexavataaars — deterministic avatars for legal software</title>
<meta name="description" content="Deterministic avatars for legal software — judges, prosecutors, notaries and advocates, in business formal and court dress. A DiceBear-compatible style, MIT.">
<link rel="icon" href="${esc(FAVICON)}">
<style>${CSS}</style>
</head>
<body>
<div class="page">

<header class="masthead">
  <p class="eyebrow">DiceBear-compatible avatar style</p>
  <h1>lexavataaars</h1>
  <p class="lede">Deterministic avatars for legal software — judges, prosecutors, notaries and advocates,
  in business formal and court dress. The same seed always renders the same person.</p>
  <p class="note">Built for products where a playful robot or a smiling cartoon would read as a mistake:
  case-law research, contract drafting, court filing, matter management. Every figure below was rendered
  by <code>${PKG}</code> when this page was built.</p>
  <p class="meta">
    <span><a href="${NPM}">npm: ${PKG}</a></span>
    <span><a href="${REPO}">github</a></span>
    <span>MIT</span>
    <span>no runtime dependencies beyond <code>@dicebear/core</code></span>
  </p>
</header>

<section id="gallery">
  <h2>Forty-eight seeds</h2>
  <p class="note">Names in, avatars out. Nothing here was curated or retouched: this is
  <code>createAvatar({ seed })</code> on an alphabet of ordinary practitioner names, in the order they
  are listed in the build script.</p>
  <div class="wall">${wall}</div>
</section>

<section id="install">
  <h2>Install</h2>
  <div class="prose">
  ${code(`bun add ${PKG}     # or: npm i ${PKG}`)}
  ${code(`import { createAvatar } from '${PKG}'

const avatar = createAvatar({ seed: user.id })

avatar.toString()   // SVG markup
avatar.toDataUri()  // data:image/svg+xml,… for <img src>`)}
  <p class="note"><code>@dicebear/core</code> is the only dependency. Rendering is synchronous and does
  no I/O, so it works the same in a server render, a build step or the browser.</p>
  </div>
</section>

<section id="wardrobe">
  <h2>The wardrobe</h2>
  <p class="note">Fourteen garments, thirteen of them drawn for this fork on the source's own shoulder
  and neckline geometry. Business formal outweighs court and academic dress roughly six to one, so a wall
  of these reads as a profession rather than as a costume department. Pin one with
  <code>clothesVariant</code>.</p>
  <div class="rack">${wardrobe}</div>
</section>

<section id="options">
  <h2>Options</h2>
  <div class="prose">
  <p>The definition is a plain DiceBear style, so it takes DiceBear's render options —
  <code>seed</code>, <code>size</code>, <code>scale</code>, <code>rotate</code>, <code>flip</code>,
  <code>borderRadius</code>, <code>backgroundColor</code>, <code>idRandomization</code> — plus one option per
  colour group and one per component.</p>
  </div>

  <h3>Colour groups</h3>
  <p class="note">Each group below is an independent axis. Pass an array of hex values (without
  <code>#</code>) to restrict what the seed may choose from; pass one value to pin it outright. Splitting
  robe from facing, and shirt from accent, is what makes a house palette possible without touching the
  artwork.</p>
  <div class="scroller"><table>
    <thead><tr><th scope="col">Option</th><th scope="col">Palette</th><th scope="col"></th></tr></thead>
    <tbody>${swatches}</tbody>
  </table></div>

  <div class="strip">${recolours}</div>

  <h3>Gradients</h3>
  <p class="note">Every colour group also exposes
  <code>&lt;name&gt;ColorFill</code> (<code>solid</code>, <code>linear</code> or <code>radial</code>),
  <code>&lt;name&gt;ColorFillStops</code> and <code>&lt;name&gt;ColorAngle</code>. They are DiceBear's,
  not this style's, and they are worth knowing about mainly because a house brand sometimes needs one.</p>
  ${code(`createAvatar({
  seed: user.id,
  accentColor: ['7c2529'],
  accentColorFill: ['linear'],
  accentColorAngle: [45],
})`)}

  <h3>Pinning components</h3>
  <div class="scroller"><table>
    <thead><tr><th scope="col">Option</th><th scope="col">Values</th></tr></thead>
    <tbody>${variantTable}</tbody>
  </table></div>
  <p class="note">There is no notion of a role in this library, deliberately. A “judge” or a “notary” is
  something you compose in your own code out of the options above, and keep, because it is your product's
  decision rather than the library's.</p>
  ${code(`const JUDGE = {
  clothesVariant: ['gown', 'gownAndBands'],
  robeColor: ['17171a'],
  facingColor: ['2a2a2e'],
} as const

const ADVOCATE = {
  clothesVariant: ['suit', 'suitAndWaistcoat', 'doubleBreastedSuit'],
  clothesColor: ['262e33', '2b3542'],
  accentColor: ['7c2529'],
} as const

createAvatar({ seed: user.id, ...JUDGE })`)}
</section>

<section id="sizes">
  <h2>At the sizes it really appears</h2>
  <p class="note">In a real product these turn up in a 16px table cell far more often than in a 128px
  profile card, so the artwork is tuned for the small end: the hair silhouette, the torso colour and the
  skin-to-cloth contrast are the only three things that survive down there, which is why the suiting
  palette is eight dark values and why the wig and the biretta earn their weight.</p>
  <div class="ladder">${ladderBare}</div>
  <h3>The same ladder with a background</h3>
  <p class="note">The style has no background component — an avatar composites straight onto your
  surface, which is what lets it sit in a table row without a card around it. Below about 24px you
  generally want one anyway: a transparent figure on a busy or dark surface loses its edges. Pass
  <code>backgroundColor</code> (and <code>borderRadius</code> if you want it circular) rather than wrapping it
  in a div, so the shape travels with the SVG.</p>
  <div class="ladder">${ladderBacked}</div>
  ${code(`createAvatar({ seed: user.id, size: 16, backgroundColor: ['e8e3d9'], borderRadius: 50 })`)}
</section>

<section id="dicebear">
  <h2>DiceBear compatibility</h2>
  <div class="prose">
  <p>The style is not a re-implementation of DiceBear — it <em>is</em> a DiceBear style. The whole thing
  is one JSON definition validated against <code>@dicebear/schema</code>, and it is exported so you can
  hand it to anything in that ecosystem:</p>
  ${code(`import definition from '${PKG}/definition.json' with { type: 'json' }`)}
  <p class="note">That file works with DiceBear's CLI, their PNG and JPEG converters, their HTTP API when
  self-hosted, and their PHP, Python, Rust, Go and Dart ports — none of which this project has to
  maintain, and none of which need to know this style exists. The JavaScript wrapper published here adds
  nothing but a parsed <code>Style</code> instance and <code>idRandomization</code> on by default, which
  keeps two avatars on one page from sharing internal SVG ids.</p>
  </div>
</section>

<section id="licence">
  <h2>Licence and provenance</h2>
  <div class="prose">
  <p>MIT, on both sides — this project's code and the artwork it derives from.</p>
  <p class="note">The figures are derived from
  <a href="https://github.com/fangpenlin/avataaars">Avataaars</a>, © Pablo Stanley and Fang-Pen Lin,
  MIT-licensed, and the path data reaches this project through
  <a href="https://www.dicebear.com/">DiceBear</a>'s MIT-licensed remix of it. Both upstream notices are
  reproduced in <a href="${REPO}/blob/main/LICENSE">LICENSE</a>, which is where MIT requires them to
  travel, and they must travel with any copy of this one too.</p>
  <p class="note">What this fork adds on top: a legal wardrobe of fourteen garments, a subtractive pass
  that removed every hat, hoodie, graphic tee and party accessory upstream shipped, faces measured to
  carry no expression, and colour groups split so robe, facing, shirt and accent can be set
  independently.</p>
  </div>
</section>

<footer>
  <p>Every avatar on this page was generated at build time by <code>${PKG}</code> and inlined into the
  HTML. The page loads no scripts, no fonts and no images from anywhere — it is one file.</p>
</footer>

</div>
</body>
</html>
`

await mkdir(OUT, { recursive: true })
// Tells GitHub Pages to serve the directory as-is rather than running it through Jekyll.
await writeFile(join(OUT, '.nojekyll'), '')
await writeFile(join(OUT, 'index.html'), HTML)

console.log(`docs/index.html — ${(HTML.length / 1024).toFixed(0)} kB`)
