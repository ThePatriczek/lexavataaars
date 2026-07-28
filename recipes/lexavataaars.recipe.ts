/**
 * The lexavataaars figure style — a legal-professional avatar set derived from Avataaars.
 *
 * LICENCE: MIT, on both sides. The artwork is Pablo Stanley's, released under MIT at
 * https://github.com/fangpenlin/avataaars with Pablo Stanley named as a copyright holder; the path data
 * reaches this project via DiceBear's MIT-licensed remix. Both upstream notices are reproduced in the
 * repository LICENSE, which is where MIT requires them to travel. `LICENCE.md` in this recipe's
 * directory records the chain piece by piece, including why an earlier version of this file wrongly
 * held the style back as unshippable.
 *
 * WHAT THIS IS, AS DESIGN
 *
 * The brief was to find out whether the most consumer-coded of the candidate styles could be brought
 * into a register that survives a judge looking at it. The approach was subtractive first and additive
 * second, in that order, because upstream's problem is not that it lacks legal dress — it is that it is
 * relentlessly cheerful, and cheerfulness cannot be covered up by adding a gown over it.
 *
 * So: 103 variants in, 49 out. Every hat, hoodie, sweater, overall, graphic tee, party accessory and
 * sunglass is gone. Of twelve mouths one survived; of twelve eyes one; of thirteen brows one. One
 * component — `clothesGraphic` — was emptied and deleted outright rather than kept alive by a token
 * survivor.
 *
 * Then twelve garments were built on the blazer's own geometry (see `hand.ts`), plus a wig, a biretta,
 * two calmer mouths, two flat brows and a hooded eye. The success test is that a viewer should not be
 * able to tell which variants shipped and which were drawn.
 *
 * NO EXPRESSION, AND THIS IS MEASURED
 *
 * Mood is not a dimension here. Every brow and mouth was rasterised and its midline read at 15%, 50%
 * and 85% of its span; anything whose ends depart from its middle is carrying an expression, whatever
 * its name says. Upstream's `default` brow tilts 2.16 units, `angry` 3.63, `sadConcerned` -3.44. Every
 * brow and mouth in this style measures zero to within 0.03. That test lives in
 * `.review/avataaars-measure.ts` and should be re-run if any of them is ever touched.
 *
 * Note the measurement trap, because it produced a wrong answer here first: reading the TOP edge of a
 * rounded bar reports its cap radius as an arch. A level 24x6 rect with rx=3 scores 2.5 that way, which
 * is why upstream's `flatNatural` was briefly and wrongly condemned. The midline is the honest measure.
 *
 * WHAT IS DELIBERATELY ABSENT
 *
 *   No medallion, plate, frame or ornament, and no struck emblems. Upstream has none of that.
 *   No background component. Upstream has none, which is also why the shirt palette is greyed.
 *   No gender dimension. One wardrobe, shared; variety is carried by hair and face.
 *
 * SIXTEEN PIXELS
 *
 * The product renders these in a 16px slot, where every face edit above is invisible and only three
 * things survive: the outline of the hair, the colour of the torso, and the contrast between skin and
 * clothes. That is why the wig and the biretta earn their weight despite being the two hardest things
 * in the file, and why the suiting palette was cut back to eight dark values — at 16px a pastel torso
 * is the single loudest signal that this is a toy.
 */

import type { Element, Recipe } from '@lexavataaars/forge'
import {
  CLOTHES_VARIANTS,
  EYEBROW_ADDITIONS,
  MOUTH_ADDITIONS,
  TOP_ADDITIONS,
} from './lexavataaars/hand.ts'
import {
  accessories,
  CANVAS,
  eyebrows,
  eyes,
  facialHair,
  HEAD_ELEMENTS,
  mouth,
  nose,
  PLACEMENT,
  top,
} from './lexavataaars/source.g.ts'

/** A source variant, with a selection weight attached. */
function weigh<T extends { variants: Record<string, { elements: unknown[] }> }>(
  component: T,
  weights: Record<string, number>,
) {
  return Object.fromEntries(
    Object.entries(component.variants).map(([name, variant]) => [
      name,
      { ...variant, weight: weights[name] ?? 1 },
    ]),
  ) as Record<string, { elements: import('@lexavataaars/forge').Element[]; weight: number }>
}

/** Wraps children in upstream's own placement transform for a slot. */
function placed(name: string, children: Element[]): Element {
  return {
    type: 'element',
    name: 'g',
    attributes: { transform: PLACEMENT[name] ?? '' },
    children,
  }
}

/** Renders a component exactly where the source put it. Registration is why this fork is viable at all. */
function at(name: string): Element {
  return placed(name, [{ type: 'component', name }])
}

/** Upstream's plain pupils — the only eye in the style, so it is geometry rather than a component. */
const EYES: Element[] = eyes.variants.default?.elements ?? []

export const lexavataaars: Recipe = {
  name: 'lexavataaars',
  canvas: { width: CANVAS.width, height: CANVAS.height },

  meta: {
    // MIT, and the grant is issued in the artwork author's own name — Pablo Stanley is a named copyright
    // holder in https://github.com/fangpenlin/avataaars/blob/master/LICENSE. See LICENCE.md in this
    // recipe's directory for the full chain and for what the earlier, looser wording actually covered.
    license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' },
    // `creator` is who made THIS style; `source` is where the underlying artwork came from. They were
    // briefly both set to the Avataaars authors, which made the DiceBear CLI announce this adaptation as
    // their work. Upstream's credit belongs in `source` and in the notices in LICENSE, and it is intact
    // there; naming them here instead was an under-claim, not politeness.
    creator: { name: 'Patrik Szewczyk', url: 'https://github.com/ThePatriczek' },
    source: { name: 'Avataaars (MIT)', url: 'https://github.com/fangpenlin/avataaars' },
  },

  // Inert: every component here is inline geometry, not an ingested icon. Stated because the type
  // requires it, not because anything reads it.
  stroke: { linecap: 'round', linejoin: 'round' },

  colors: {
    /**
     * The source's skin range, minus `#f8d25c` and `#fd9841`.
     *
     * Those two are not skin — they are cartoon yellow and traffic-cone orange, and they were the single
     * loudest remaining signal that this is a toy. On a wall of sixty they turned up on roughly a third
     * of the figures and undid every calming edit made to the faces above them. What is left is the
     * source's own five-tone range, which is one of the things it gets right.
     */
    skin: { values: ['#614335', '#d08b5b', '#ae5d29', '#edb98a', '#ffdbb4'] },
    /**
     * Upstream's hair list minus `#f59797` (pink) and `#c93305` (pillar-box red), with the two palest
     * values deepened and a constraint added.
     *
     * The defect: `#e8e1e1` is all but white, and this style has no background, so on a light surface
     * the head simply lost its outline. Silver and white hair are wanted — this audience skews older
     * and the style needs more grey, not less — so the values stay and are darkened to `#d8d4d0` and
     * `#ddd2bc`, which still read as silver and platinum but hold an edge against white.
     *
     * `notEqualTo: ['skin']` stops the other half of the failure, where pale hair lands on pale skin and
     * the hairline disappears into the forehead.
     *
     * `contrastTo` is the constraint that looks right here and is not usable: it replaces random
     * selection with a deterministic maximum-contrast pick, so eight hair values against five skin tones
     * would collapse to at most five hair colours in the whole style, and every pale-skinned figure
     * would get the same near-black hair. The variety is the point.
     */
    hair: {
      values: ['#a55728', '#2c1b18', '#b58143', '#d6b370', '#724133', '#4a312c', '#ddd2bc', '#d8d4d0'],
      notEqualTo: ['skin'],
    },
    facialHair: {
      values: ['#a55728', '#2c1b18', '#b58143', '#d6b370', '#724133', '#4a312c', '#ecdcbf', '#e8e1e1'],
      notEqualTo: ['skin'],
    },
    /**
     * Suiting. The source's clothes palette is fourteen values of which nine are pastels and brights;
     * two survived (`#262e33`, `#3c4f5c`). The rest are the tones a suit is actually cut in.
     *
     * This is the single highest-leverage change in the whole file. At 16px the torso is roughly a
     * third of the visible pixels and carries no shape information at all, so its *colour* is the style's
     * loudest statement. Left alone it says toy, however carefully the face above it is drawn.
     */
    clothes: {
      values: [
        '#262e33', // charcoal (source)
        '#1c1c1e', // near-black
        '#2b3542', // slate navy
        '#3c4f5c', // slate (source)
        '#3e3a34', // dark taupe
        '#4a4f55', // graphite
        '#2f3a33', // dark olive
        '#54463f', // brown
      ],
      notEqualTo: ['skin'],
    },
    /** Court and academic dress is black. Three near-blacks so it is not flat, and nothing else. */
    robe: { values: ['#17171a', '#1f1c20', '#22201d'] },
    /**
     * Silk facings on a gown, as their own group rather than a white overlay on the body.
     *
     * Splitting them is what lets a consumer set the two independently — and it is also what stopped the
     * facings being invisible, which they were for three rounds while drawn as 10% white. Every value
     * here is lighter than every `robe` value, so the band always reads against the body it sits on;
     * `notEqualTo` alone would only have ruled out an exact match.
     */
    facing: { values: ['#2a2a2e', '#33302b', '#262b2e', '#312c30'], notEqualTo: ['robe'] },
    /**
     * Shirt linen — greyer than a real shirt, on purpose.
     *
     * This style has no background component, so an avatar is composited straight onto whatever the
     * product's surface is. At true white the `shirtAndTie` variant lost its whole torso against a white
     * page and left a head floating above a tie. These values still read as linen and still hold an edge.
     */
    shirt: { values: ['#dcdbd7', '#e2e0da', '#d5dbe2', '#ded8cc'] },
    /**
     * The one saturated note in the style, and it appears on exactly one element at a time: the tie, or
     * the hood. Barred from matching the suit so it never sinks into the chest.
     */
    accent: {
      values: ['#7c2529', '#1f4c63', '#2f5d4c', '#4a3a5c', '#8c6a2f', '#5b1f2e'],
      notEqualTo: ['clothes'],
    },
    /**
     * A wig is off-white. Never `hair`, or a third of them come out ginger.
     *
     * Pitched deliberately darker than horsehair actually is, and darkened twice. At `#e8e4dc` it
     * vanished against a pale background; at `#dcd6c8` it still only just held. A white wig on a white
     * page is the same failure as white hair and rather more likely, because the wig has only two values
     * and no dark ones to fall back on. These two read as horsehair and survive a white surface.
     */
    wig: { values: ['#cfc7b5', '#bdb3a0'], notEqualTo: ['skin'] },
    /** Spectacle frames: metal, horn, tortoise. The source's list was mostly sky blue. */
    accessories: {
      values: ['#262e33', '#3c4f5c', '#6b5a45', '#8a7247', '#929598', '#4a3b32'],
      notEqualTo: ['skin'],
    },
    /** The biretta, and nothing else now that hijab and turban are gone. */
    hat: {
      values: ['#262e33', '#3c4f5c', '#4a4f55', '#5b4a3f', '#2f3a33', '#e6e6e6'],
      notEqualTo: ['skin'],
    },
  },

  components: {
    /**
     * Dress. Fourteen variants, thirteen of them built here rather than shipped.
     *
     * The derivation chain is the point: shirt → +collar → +tie → +waistcoat → +jacket is one three-piece
     * suit assembled from four independent layers, and gown is the same jacket with its lapels replaced
     * and its fronts swung outward. Nothing was traced from scratch, which is why nothing needs nudging
     * to sit right on the shoulders.
     *
     * The weighting matters more than it looks: business formal is 57 of 69, court and academic dress
     * 12. A wall of these should read as a profession, not as a costume department. The
     * source's own `blazerAndShirt` is kept — worn open, as `blazer` — because it is the one garment
     * that shipped with the style and still belongs in the room.
     */
    clothes: { source: 'inline', width: 200, height: 95.31, variants: CLOTHES_VARIANTS },

    /** Unchanged, and the only component that needed no decision. */
    nose: { source: 'inline', width: nose.width, height: nose.height, variants: weigh(nose, {}) },

    /**
     * One mouth in, three out — all three now measurably level.
     *
     * Eleven of upstream's twelve are expressions and `serious` alone is a bar. One mouth across a whole
     * style makes every avatar the same person, so two more are that bar re-proportioned. An earlier
     * `set` drawn as a curved lens measured a 2.69-unit downturn at the corners, which reads as
     * displeased and is as wrong as a smile; all three are rounded rectangles now, so cant is zero.
     */
    mouth: {
      source: 'inline',
      width: mouth.width,
      height: mouth.height,
      variants: { ...weigh(mouth, { serious: 5 }), ...MOUTH_ADDITIONS },
    },

    /**
     * Brows carry more emotion per pixel than anything else on the face, so twelve of upstream's
     * thirteen are gone and the survivor was chosen by measurement rather than by eye.
     *
     * Every shape was rasterised and its midline read at 15%, 50% and 85% of its span. `angry` tilts
     * 3.63 units, `raisedExcited` 3.81, `sadConcerned` -3.44, `defaultNatural` 1.81 — and even `default`,
     * the one whose name implies neutrality, 2.16. `flatNatural` measures -0.19, level to within a fifth
     * of a unit, so it stays.
     *
     * The other two are drawn with a dead-straight top edge and flank it in weight, so the set spans
     * fine to heavy without any of them carrying an expression. All three measure zero tilt.
     */
    eyebrows: {
      source: 'inline',
      width: eyebrows.width,
      height: eyebrows.height,
      variants: { ...weigh(eyebrows, { flatNatural: 4 }), ...EYEBROW_ADDITIONS },
    },

    /**
     * Hair, and the component that does the most work at 16px because it is the only thing that changes
     * the outline of the head.
     *
     * Fourteen of upstream's thirty-four went: every winter hat, the bucket hat, the flower crown, the
     * headband, the mullet, the shaved sides, the spiked frizzle — and then `turban` and `hijab`, on a
     * later scope decision by the project owner.
     *
     * Two were added, and they are the two most legally legible silhouettes available: the barrister's
     * wig and the biretta. Both are rare on purpose. A wall of wigs is a cartoon of a courtroom.
     */
    top: {
      source: 'inline',
      width: top.width,
      height: top.height,
      probability: 100,
      variants: {
        ...weigh(top, {
          shortFlat: 6,
          shortWaved: 6,
          shortRound: 5,
          theCaesar: 5,
          theCaesarAndSidePart: 5,
          straight01: 5,
          straight02: 5,
          bob: 5,
          bun: 4,
          longButNotTooLong: 4,
          shortCurly: 4,
          straightAndStrand: 4,
          curvy: 3,
          miaWallace: 3,
          sides: 3,
          curly: 3,
          fro: 3,
          bigHair: 2,
          dreads: 2,
          dreads01: 2,
        }),
        ...TOP_ADDITIONS,
      },
    },

    /**
     * Spectacles, and nothing else. The eyepatch, the two pairs of sunglasses and the Kurt frames were
     * the clearest cuts in the style.
     *
     * 24% is deliberately at the top of DiceBear's own 5–30% band. Reading glasses are commoner in this
     * profession than in the general population, and they are the one accessory that adds seriousness
     * rather than spending it.
     */
    accessories: {
      source: 'inline',
      width: accessories.width,
      height: accessories.height,
      probability: 24,
      variants: weigh(accessories, { prescription01: 4, prescription02: 4, round: 3 }),
    },

    /**
     * Trimmed to three. `beardMajestic` is a full patriarch's beard that swallows the chin and reads as
     * a character rather than a person; `moustacheFancy` is waxed and curled at the ends, which is a
     * joke about lawyers rather than a lawyer.
     */
    facialHair: {
      source: 'inline',
      width: facialHair.width,
      height: facialHair.height,
      probability: 14,
      variants: weigh(facialHair, { beardLight: 4, beardMedium: 3, moustacheMagnum: 2 }),
    },
  },

  /**
   * The source's own canvas, unchanged: head and neck drawn inline, then every component at the exact
   * translate the source used. `place` is not used here — it would recompute placements that are already
   * correct, and any drift at all detaches the collar from the throat.
   *
   * `clothesGraphic` is gone with `graphicShirt`, so the reference to it is gone too.
   */
  canvasElements: () => [
    ...HEAD_ELEMENTS,
    /*
     * The eyes are drawn onto the canvas rather than published as a component.
     *
     * Eleven of upstream's twelve were mood on their face — crying, rolling, winking, hearts, X-dizzy —
     * and `closed` and `side` went later on the project owner's instruction, which was right: closed
     * eyes read as asleep, a sideways glance as sly, and a glance is an *action*, which is what an
     * avatar must not do. A hooded eye drawn to replace them failed the style's own tilt test.
     *
     * That leaves one variant, and a component with one variant publishes an `eyesVariant` option a
     * consumer can set but never vary — the worst possible API for the one thing this style is claiming
     * is not variable. So there is no option at all.
     */
    placed('eyes', EYES),
    at('clothes'),
    at('mouth'),
    at('nose'),
    at('eyes'),
    at('eyebrows'),
    at('top'),
    at('facialHair'),
    at('accessories'),
  ],
}

export default lexavataaars
