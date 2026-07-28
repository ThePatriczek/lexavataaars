/**
 * Everything drawn or edited by hand for `lexavataaars`.
 *
 * The rule for this file is the one in the brief: derive, don't redraw. Every garment below is built on
 * geometry already present in the source — the blazer's shirt body, its shoulder arcs, its neckline, its
 * lapels — so a new variant lands in register with the head by construction rather than by nudging
 * numbers until it looks right. Where a coordinate is stated literally it was solved from the source's
 * own circles, not guessed:
 *
 *   Torso. The shoulders are two 72-unit arcs centred at (72, 86.36) and (128, 86.36); the body is
 *   therefore bounded by |x - centre| = √(72² - (86.36 - y)²) and squared off at y = 95.31. Every panel
 *   here is checked against that envelope, which is why nothing spills past a shoulder.
 *
 *   Neckline. One ellipse arc from (67, 15.65) through (100.5, 37.13) to (134, 15.65). Collars, gown
 *   fronts and the hood all start on it, so the garment meets the throat instead of crossing it.
 *
 *   Mirror. The source's own axis is x = 100 in clothes space and x = 132 in top space (the skull is a
 *   56-unit circle centred there). Right-hand halves are those reflections, not fresh drawings.
 *
 * Shading follows the source's single idiom throughout: black at a low `fill-opacity`, never a second
 * hue. That is what makes an added garment sit at the same depth as a shipped one.
 */

import type { Element } from '@lexavataaars/forge'

const CLOTHES = { type: 'color' as const, name: 'clothes' }
const ROBE = { type: 'color' as const, name: 'robe' }
const FACING = { type: 'color' as const, name: 'facing' }
const SHIRT = { type: 'color' as const, name: 'shirt' }
const ACCENT = { type: 'color' as const, name: 'accent' }
const HAIR = { type: 'color' as const, name: 'hair' }
const HAT = { type: 'color' as const, name: 'hat' }
const WIG = { type: 'color' as const, name: 'wig' }

type Fill = string | { type: 'color'; name: string }

function path(d: string, fill: Fill, extra: Record<string, string> = {}): Element {
  return { type: 'element', name: 'path', attributes: { d, fill, ...extra } }
}

/** The source's shading gesture: black, low opacity, no hue of its own. */
function shade(d: string, opacity: number): Element {
  return path(d, 'black', { 'fill-opacity': String(opacity) })
}

// ---------------------------------------------------------------------------------------------------
// clothes — 200 × 95.31, placed at translate(40 184.7)
// ---------------------------------------------------------------------------------------------------

/** The blazer's own torso, reused unchanged as the shirt every garment is layered onto. */
const TORSO =
  'M100.5 37.13c18.5 0 33.5-9.61 33.5-21.48q0-.52-.04-1.05A72 72 0 0 1 200 86.36v8.95H0v-8.95' +
  'a72 72 0 0 1 67.05-71.83q-.05.55-.05 1.12c0 11.87 15 21.48 33.5 21.48'

/**
 * The same torso with its shoulder arcs pulled in a unit and a half, for use UNDER an outer garment.
 *
 * Every outer garment here is built on the source's own r = 72 shoulder arcs, and so is the shirt — so
 * the shirt's outline and the coat's outline were the same curve, one drawn straight on top of the
 * other. Two coincident edges do not cancel: each antialiases against what is behind IT, so the boundary
 * pixel came out part shirt, part coat and part background, and because the shirt is far the lightest of
 * the three the result was a pale rim tracing both shoulders. On a dark background at 96px — which is a
 * size this actually ships at — it read as a halo around every suited figure.
 *
 * Insetting the layer underneath is the safe direction to fix it in: nothing here is a silhouette, so
 * nothing visible moves, and 1.5 units is far inside the narrowest point of any coat that covers it.
 * Growing the coats instead would have made the gown a unit wider than the blazer at the same seed.
 *
 * The neckline is deliberately NOT inset — it is shared with the collar and with every garment that
 * meets the throat, and moving it is what detaches a collar from a neck.
 */
const TORSO_UNDER =
  'M100.5 37.13c18.5 0 33.5-9.61 33.5-21.48L133.84 16.09A70.5 70.5 0 0 1 198.5 86.36V95.31H1.5V86.36' +
  'A70.5 70.5 0 0 1 67.15 16.02L67 15.65c0 11.87 15 21.48 33.5 21.48'

/** The source's neck shadow, which is what keeps the head from looking pasted onto the shoulders. */
const NECK_SHADOW =
  'M100.5 44.07c21.89 0 39.63-12.05 39.63-26.92q0-.9-.08-1.79-3-.51-6.1-.76.06.52.05 1.05' +
  'c0 11.87-15 21.48-33.5 21.48S67 27.52 67 15.65q0-.57.05-1.12-3.08.2-6.08.67-.1.97-.1 1.95' +
  'c0 14.87 17.74 26.92 39.63 26.92'

/** Blazer fronts, lapel-fold shadow and pocket square, all lifted from `blazerAndShirt` unaltered. */
const JACKET_FRONTS =
  'M68.78 14.43 69 13.3c-2.96.06-6 1-6 1l-.42.67A72 72 0 0 0 0 86.36v8.95h74s-10.7-51.56-5.24-80.8z' +
  'M126 95.3s11-53 5-82c2.96.06 6 1 6 1l.42.67A72 72 0 0 1 200 86.36v8.95z'
const LAPEL_FOLD =
  'M69 13.3c-6 29 5 82 5 82H58l-14-36 6-9-6-6 19-30s3.04-.94 6-1' +
  'm62 0c6 29-5 82-5 82h16l14-36-6-9 6-6-19-30s-3.04-.94-6-1'
const POCKET_SQUARE = 'm151.42 71.07.87-2.24 6.27-4.7a4 4 0 0 1 4.85.05l6.6 5.13z'

/**
 * The shirt collar the source never needed, because a blazer worn open hides it.
 *
 * Both flaps start on the neckline arc itself — the first two commands are the source's own curve,
 * copied and mirrored — then drop to a point below the throat. Drawn this way the collar cannot detach
 * from the neck, however the head above it changes.
 */
const COLLAR_LEFT = 'M67 15.65c0 11.87 15 21.48 33.5 21.48l-5.5 15.9c-12-4-22-16-28-37.38z'
const COLLAR_RIGHT = 'M134 15.65c0 11.87-15 21.48-33.5 21.48l5.5 15.9c12-4 22-16 28-37.38z'

/**
 * The collar band — the piece that turns two flat wedges into a collar.
 *
 * Set beside upstream's own `collarAndSweater` the first version read as paper: two triangles with no
 * thickness, sitting on the neck rather than round it. A real collar has a band that wraps the throat
 * and points that fall from it, and the band is what gives the whole thing depth. It is the neckline
 * curve and the same curve dropped seven units, so it wraps the neck by construction.
 *
 * This is the highest-leverage drawing in the style: it appears in all fourteen garments.
 */
const COLLAR_BAND =
  'M67 15.65C67 27.52 82 37.13 100.5 37.13 119 37.13 134 27.52 134 15.65' +
  'L134 22.9C134 34.77 119 44.38 100.5 44.38 82 44.38 67 34.77 67 22.9z'

// The two flaps are the same shape, so without asymmetric shading they fuse into one white blob under
// the chin. The near-side flap is lifted and the far one dropped, which is the only thing that makes the
// collar read as two pieces of cloth rather than a bib.
const collar: Element[] = [
  path(COLLAR_LEFT, SHIRT),
  path(COLLAR_RIGHT, SHIRT),
  shade(COLLAR_LEFT, 0.04),
  shade(COLLAR_RIGHT, 0.16),
  // The shadow the band casts on the shirt below it. Without this the band reads as printed on rather
  // than as a separate piece of cloth standing away from the chest.
  shade('M69 22C71 34 84 45 100.5 45 117 45 130 34 132 22l4 4C133 39 118 50 100.5 50 83 50 68 39 65 26z', 0.1),
  path(COLLAR_BAND, SHIRT),
  // One soft edge under the band's fold, in upstream's own idiom: black at low opacity, never a hue.
  shade('M100.5 37.13C119 37.13 134 27.52 134 15.65v3.2C134 30.7 119 40.3 100.5 40.3z', 0.12),
]

/**
 * Knot and blade, hung from the throat notch at (100.5, 37) where the two collar points meet.
 *
 * The knot carries a dimple and a lit left face. Without them the tie is one flat trapezoid running from
 * the chin to the hem — a strip of card rather than folded cloth — which is exactly how it read beside
 * upstream's tailoring.
 */
const tie: Element[] = [
  /*
   * The blade's top edge is the knot's bottom edge lifted two units, so the two OVERLAP rather than abut.
   *
   * Drawn flush they shared an edge exactly, and two adjacent fills antialias against whatever is behind
   * them rather than against each other: at the join each pixel came out part knot, part blade and part
   * shirt, and a pale hairline traced the V under the knot at every size the tie was more than a few
   * pixels wide. Since both pieces carry the same `accent` fill the overlap is invisible, and the knot is
   * drawn over the blade so the silhouette is unchanged.
   */
  path('M91 50 100.5 54 110 50 114 95.31H87z', ACCENT),
  path('M93 40h15l2 12-9.5 4-9.5-4z', ACCENT),
  // The blade's right face turned away from the light, and the shadow the knot casts on it.
  shade('M100.5 56 110 52 114 95.31h-13.5z', 0.1),
  shade('M91 52 100.5 56 110 52 110.8 60 100.5 64 90.2 60z', 0.14),
  // The dimple: a small fold below the knot's top edge, which is the detail that says "tied".
  shade('M97.6 41.5h5.8l-2.9 5z', 0.16),
  path('M93 40h7.5v16l-9.5-4z', 'white', { 'fill-opacity': '.07' }),
]

/**
 * A bow, hung from the same throat notch as the tie so the two are interchangeable.
 *
 * The wings are pinched rather than straight-sided — a plain triangle reads as a paper dart at this
 * size. Same accent group as the tie, because only one element in the figure may carry colour.
 */
const bow: Element[] = [
  path('M100.5 44 85 35.5q3 8.5 0 17z', ACCENT),
  path('M100.5 44 116 35.5q-3 8.5 0 17z', ACCENT),
  shade('M100.5 44 116 35.5q-3 8.5 0 17z', 0.12),
  {
    type: 'element',
    name: 'rect',
    attributes: { x: '96.5', y: '38.5', width: '8', height: '11', rx: '2.5', fill: ACCENT },
  },
  shade('M100.5 38.5h4a2.5 2.5 0 0 1 2.5 2.5v6a2.5 2.5 0 0 1-2.5 2.5h-4z', 0.14),
  path('M96.5 41a2.5 2.5 0 0 1 2.5-2.5h1.5v11H99a2.5 2.5 0 0 1-2.5-2.5z', 'white', { 'fill-opacity': '.09' }),
]

/**
 * A cravat — a folded neckcloth filling the collar's opening rather than hanging from it.
 *
 * Worth its own variant because it is a different *shape* at the throat, not a different colour: where
 * the tie and the bow are narrow objects on a field of shirt, this fills the V completely. That reads
 * differently at every size, including at 16px where the tie is one pixel wide and this is four.
 */
const cravat: Element[] = [
  /*
   * Bulged in the middle and tapered to a foot, because cloth gathered at the throat swells and then
   * tucks away. Drawn first as a rounded rectangle with a pin at its centre it read, unmistakably, as a
   * luggage tag — the straight sides and the dot together made it an object rather than a garment. The
   * pin is gone and the silhouette does the work.
   */
  path('M94 40h13q4 10 4 16 0 6.5-7 10.5a6 6 0 0 1-7 0Q90 62.5 90 56q0-6 4-16z', ACCENT),
  /*
   * The shadow's edge runs from x = 103, not from the centre line, and the highlight is a crescent
   * rather than a band across the full width.
   *
   * Both were symmetrical about x = 100.5, which is also the shape's own axis — so the light/dark
   * terminator lay exactly along the fold the silhouette already implies, and at 6× the cravat read as
   * two flat halves butted together with a seam down the middle. A light edge that coincides with an
   * axis of symmetry always reads as a join. Offsetting it by two and a half units is enough for the
   * shading to describe a rounded surface instead.
   *
   * The foot is rounded for the same reason the hood's is: cloth tucking away does not end in a point.
   */
  shade('M103 40h4q4 10 4 16 0 6.5-7 10.5a6 6 0 0 1-3.5.9z', 0.12),
  path('M94 40h9q-1.5 4-2 7-6 1.6-10.5-.2Q92.8 43 94 40z', 'white', { 'fill-opacity': '.16' }),
]

/**
 * The neckline, as its own path, in both directions.
 *
 * Anything that meets the throat is built from these rather than from a chord between their endpoints.
 * A straight line from (67, 15.65) to (134, 15.65) looks like it lies along the top of the garment, but
 * the neck scoop hangs 21 units below that chord — so a shape closed with it either paints over the neck
 * or leaves a bright sliver of skin above the cloth. Both happened, on the waistcoat and on the gown,
 * and at 96px neither was visible.
 */
const NECKLINE_LTR = 'C67 27.52 82 37.13 100.5 37.13 119 37.13 134 27.52 134 15.65'
/** The left half only, from the shoulder down to the throat notch — the source's own curve, split at t=0.5. */
const NECKLINE_HALF_REL = 'c0 5.94 3.75 11.31 9.81 15.19'
/** Where that half ends: the point on the neckline directly below the shoulder-to-notch midpoint. */
const NECK_L = { x: 76.81, y: 30.84 }
const NECK_R = { x: 124.19, y: 30.84 }
/** The neckline from x ≈ 85 through the notch to x ≈ 116 — the top edge of anything worn at the throat. */
const THROAT_SPAN =
  'M85.11 34.73C89.72 36.27 94.95 37.13 100.5 37.13 106.05 37.13 111.28 36.27 115.89 34.73'

/**
 * Waistcoat: the torso again, with a V punched out of it by the even-odd rule.
 *
 * Cutting the opening rather than drawing a panel around it is what guarantees the waistcoat's outline
 * *is* the body's outline. The cut is bounded above by the neckline itself, not by a chord across it, so
 * the opening begins exactly where the collar does and cannot expose skin at the shoulders.
 */
const WAISTCOAT_V = `M134 15.65 100.5 70 67 15.65${NECKLINE_LTR}z`
const waistcoat: Element[] = [
  path(`${TORSO}${WAISTCOAT_V}`, CLOTHES, { 'fill-rule': 'evenodd' }),
  shade(`${TORSO}${WAISTCOAT_V}`, 0.16),
]

const jacket: Element[] = [
  path(JACKET_FRONTS, CLOTHES),
  shade(LAPEL_FOLD, 0.15),
  path(POCKET_SQUARE, SHIRT),
]

/**
 * Double-breasted: the same jacket with the left front carried across the chest.
 *
 * The crossover is laid down *before* the fronts so the right lapel overlaps it, which is the direction
 * a real double-breasted coat wraps. Two numbers make it work and both are read off the source's own
 * lapel, not chosen: the blazer's inner edges run from x = 68.76 at y = 14.5 to x = 74 and x = 126 at the
 * hem, so the crossover has to span 66 to 134 to pass *under* both of them. Drawn 74 to 126 — flush with
 * the lapels at the hem, which looks right on paper — it fell short by three units at chest height and
 * rendered as a detached slab floating on the shirt with two free corners.
 *
 * Its own top edge is therefore never visible: what the viewer sees is the diagonal where the crossover
 * disappears behind each lapel.
 */
const doubleBreasted: Element[] = [
  // The wrap crosses at y = 64 on the left. Drawn any higher it buries the tie knot, which is where a
  // double-breasted coat's whole read lives.
  path('M66 95.31V64l68-20v51.31z', CLOTHES),
  shade('M66 64 134 44v6L66 70z', 0.1),
  ...jacket,
  // Both columns sit below the wrap line, which at x = 110 is y = 51 and at x = 121 is y = 48.
  path('M110 60a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4m0 16a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4', 'black', {
    'fill-opacity': '.4',
  }),
  path('M121 56a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4m0 16a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4', 'black', {
    'fill-opacity': '.4',
  }),
]

/**
 * Court gown: the blazer's shoulder arcs kept exactly, its lapels replaced by two plain fronts that
 * swing outward toward the hem. A gown has no notch and no revers, so removing them is the whole edit;
 * the silk facings are the strip between the new front edge and the line it would have taken.
 *
 * Each front is closed along the source's *own* shoulder arc and then along half of the source's own
 * neckline, so its top boundary is the torso's top boundary and nothing can show between them. Closed
 * with a straight line from the shoulder to the collar instead — which is how this was drawn first — the
 * gown rides above the neck scoop and a bright one-unit seam of skin runs along both shoulders.
 */
const GOWN_LEFT =
  `M${NECK_L.x} ${NECK_L.y}C70 50 62 74 60 95.31H0v-8.95A72 72 0 0 1 67.05 14.53` +
  `l-.05 1.12${NECKLINE_HALF_REL}z`
const GOWN_RIGHT =
  `M${NECK_R.x} ${NECK_R.y}C130 50 138 74 140 95.31h60v-8.95A72 72 0 0 0 133.96 14.6` +
  'l.04 1.05c0 5.94-3.75 11.31-9.81 15.19z'
/*
 * The facings run INSIDE the front edge — `h-11`, not `h11`.
 *
 * They were drawn on the outside for three rounds, which put them on the shirt rather than on the gown.
 * At 10% white over pale linen that is almost invisible, so nothing in any screenshot ever looked wrong;
 * it was found by checking the gown's fill region against the band's coordinates rather than by looking.
 * Giving them a solid colour of their own is what makes the error impossible to hide again.
 *
 * Their TOP edge is the neckline, and this is the second version of that.
 *
 * Closed with `z` from an inner point at y ≈ 31 straight back to the notch, the facing ended in a chord
 * running twelve units dead horizontal across the shoulder — a flat cut where the silk should turn up
 * into the collar. It was invisible at 330px and unmissable at 9×: a stripe laid on a gown, stopping
 * short, which is precisely the thing the facings exist not to be. Running the return curve up to
 * (67, 15.65) and closing along the source's own half-neckline instead means the facing's top boundary
 * and the gown's top boundary are the same curve, so the silk reaches the collar and turns with it.
 */
const FACING_LEFT =
  `M${NECK_L.x} ${NECK_L.y}C70 50 62 74 60 95.31h-15C47 72 53 44 60.5 21L67 15.65${NECKLINE_HALF_REL}z`
const FACING_RIGHT =
  `M${NECK_R.x} ${NECK_R.y}C130 50 138 74 140 95.31h15C154 72 148 44 140.5 21L134 15.65` +
  'c0 5.94-3.75 11.31-9.81 15.19z'
/** The lit inner half of each facing. Silk is defined by its sheen, so a flat band is just a stripe. */
const FACING_SHEEN_L =
  `M${NECK_L.x} ${NECK_L.y}C70 50 62 74 60 95.31h-6C53 73 59 47 66 22L67 15.65${NECKLINE_HALF_REL}z`
const FACING_SHEEN_R =
  `M${NECK_R.x} ${NECK_R.y}C130 50 138 74 140 95.31h6C148 73 142 47 135 22L134 15.65` +
  'c0 5.94-3.75 11.31-9.81 15.19z'
/*
 * Lit on the left, shaded on the right, and only that.
 *
 * The left facing carried a 12% white sheen AND a 25% black band over nearly the same region, which is
 * two contradictory light sources on one piece of cloth; the net was a facing darker than the one on the
 * shaded side. The style has one light direction and every other shape in it obeys the same one.
 */
const gown: Element[] = [
  path(GOWN_LEFT, ROBE),
  path(GOWN_RIGHT, ROBE),
  // Silk facings against wool. They carry their own colour group rather than a white overlay, so a
  // consumer can set them independently of the gown body — and so they cannot silently vanish again.
  path(FACING_LEFT, FACING),
  path(FACING_RIGHT, FACING),
  shade(FACING_RIGHT, 0.16),
  path(FACING_SHEEN_L, 'white', { 'fill-opacity': '.16' }),
  path(FACING_SHEEN_R, 'white', { 'fill-opacity': '.06' }),
]

/*
 * An academic stole was drawn here and cut. Geometrically it was fine — a band at the gown's front edge,
 * correctly inside it — but at the scale the torso actually occupies, a saturated band beside the collar
 * reads as a coloured lapel rather than as academic dress, and it collided with `gownAndHood`, which
 * already spends the style's one accent colour on the shoulders. Five court variants of which one is
 * weak is worse than four that are not, so the wardrobe keeps its depth in tailoring instead.
 */

/**
 * Bands, on a dark stock.
 *
 * The stock is not decoration — it is the fix for the first draft, where two white tabs drawn on a white
 * collar were geometrically perfect and completely invisible. Linen bands are worn over a dark clerical
 * stock in life, so the thing that makes them legible is also the thing that makes them correct.
 */
const bands: Element[] = [
  /*
   * The stock has to run the full length of the tabs — stopped short at y = 49 it left the lower two
   * thirds of each band white-on-white and the pair read as one small glyph — and its top edge has to be
   * the neckline, or its square corners show as two steps against the collar behind it.
   *
   * Its bottom edge is bowed rather than cut square. A horizontal line across the chest is the one edge
   * a garment never has, and at 440px the flat version read as a small dark bib laid on the shirt: the
   * eye found the straight edge before it found the bands. The bow is shallow — five units over a span
   * of twenty-seven — which is enough to say cloth without saying scallop.
   */
  path(`${THROAT_SPAN}L114 84Q100.5 89 87 84z`, ROBE),
  /*
   * Widened from 7.6 to 9, then lengthened from 31.5 to 42.
   *
   * Beside upstream's garments the first pair read as two hairlines; widening fixed that but left them
   * stubby — they stopped a third of the way down the visible chest, and against the jabot in the same
   * wardrobe they read as its top tier rather than as a different thing. Bands hang. At 42 they occupy
   * the chest the way linen does and the two court variants no longer collapse into each other at 112px.
   */
  path('M90.6 38.5h9l-2.6 42a3.4 3.4 0 0 1-6.8-.35z', SHIRT),
  path('M110.4 38.5h-9l2.6 42a3.4 3.4 0 0 0 6.8-.35z', SHIRT),
  // Lit at the top where they leave the stock, shaded down the inner edge where they fall away.
  path('M90.6 38.5h9l-.15 2.4h-9z', 'white', { 'fill-opacity': '.55' }),
  path('M101.4 38.5h9l.17 2.4h-9z', 'white', { 'fill-opacity': '.55' }),
  shade('M97.4 38.5h2.2l-2.6 42a3.4 3.4 0 0 1-2.5 1.15z', 0.1),
  shade('M110.4 38.5h-2.2l2.6 42a3.4 3.4 0 0 0 2.5 1.15z', 0.16),
]

/**
 * Three falls of lace — the same construction at three scales, which is what a jabot is.
 *
 * Same lesson as the bands: the tiers sit on a dark ground and are inset two units from it, so each fall
 * is outlined by the ground rather than by a shade line that white-on-white swallows.
 */
const jabot: Element[] = [
  /*
   * Rebuilt after seeing it beside upstream's tailoring, where it read as a small stack of white keys.
   *
   * Three changes. The falls now WIDEN as they descend, the way cloth gathered at the throat actually
   * hangs — three equal-width tiers are a stack of blocks, not a jabot. Each tier is lit on its upper
   * face and shaded where the tier below tucks under it, so the stack has depth instead of being an
   * outline drawing. And the ground now follows the lace rather than boxing it.
   *
   * Then scaled up: 21 → 41 units across the bottom tier and 22 → 32 units tall. At the old size it and
   * `gownAndBands` were the same small white glyph on black at 112px, which is the size the product
   * actually renders — two variants that cost a wardrobe slot each and were indistinguishable where it
   * counted. A jabot's whole claim against bands is that it is broad and tiered where they are narrow
   * and parallel, so it has to be visibly the wider of the two.
   */
  path(`${THROAT_SPAN}L122 68.5q-10.75 7-21.5 0-10.75 7-21.5 0z`, ROBE),
  path('M88 37h25v6q-6.25 5.5-12.5 0-6.25 5.5-12.5 0z', SHIRT),
  shade('M88 43q6.25 5.5 12.5 0 6.25 5.5 12.5 0v2.1q-6.25 5.5-12.5 0-6.25 5.5-12.5 0z', 0.09),
  path('M84 46h33v8q-8.25 6.5-16.5 0-8.25 6.5-16.5 0z', SHIRT),
  shade('M84 54q8.25 6.5 16.5 0 8.25 6.5 16.5 0v2.3q-8.25 6.5-16.5 0-8.25 6.5-16.5 0z', 0.09),
  path('M80 57h41v10q-10.25 7-20.5 0-10.25 7-20.5 0z', SHIRT),
  // The lit upper face of each fall, which is what makes them read as separate pieces of cloth.
  path('M88 37h25v2.2H88zm-4 9h33v2.2H84zm-4 11h41v2.2H80z', 'white', { 'fill-opacity': '.5' }),
]

/**
 * Academic hood, as two bands over the shoulders.
 *
 * From the front that is all a hood is — the body of it hangs behind. Drawing only what would be
 * visible keeps it from becoming a cape, which is what an earlier crescent across the whole chest read
 * as. Both bands are solved to stay inside the shoulder arcs at every height they cross.
 */
const hood: Element[] = [
  /*
   * Each band starts at (67, 17) and (134, 17) — the two points where the source's neckline meets the
   * shoulder — so it emerges from beside the neck instead of beginning in mid-shoulder.
   *
   * It began at x = 64 with a top edge cut dead horizontal six units inside the gown's own shoulder arc,
   * and on a dark ground at 6× that gap was unmissable: a strap with a squared-off end, floating, with
   * gown visible above and outside it. A hood is attached at the neck and nowhere else, so that is where
   * it has to start, and it is the one place on the shoulder that reads as attachment.
   *
   * The far end is a rounded foot rather than a straight cut across the shoulder, for the same reason
   * the biretta's hair crescent has one: a chord across a curved form reads as an amputation.
   */
  path('M67 17C63 41 54 59 39 72Q31 66 21 58C37 47 44 32 47 21z', ACCENT),
  path('M134 17c4 24 13 42 28 55q8-6 18-14c-16-11-23-26-26-37z', ACCENT),
  path('M67 17C63 41 54 59 39 72l-6-4.6C48 58 56 40 60 19z', 'white', { 'fill-opacity': '.22' }),
  path('M134 17c4 24 13 42 28 55l6-4.6C153 58 145 40 141 19z', 'white', { 'fill-opacity': '.22' }),
]

const shirtBody = (torso: string): Element[] => [path(torso, SHIRT), shade(NECK_SHADOW, 0.1)]

/**
 * Layer order is fixed everywhere: body, waistcoat, collar, neckwear, outer garment.
 *
 * `garment` is for the two variants where the shirt IS the silhouette; `coated` is for the twelve where
 * something is worn over it and its outline is therefore never seen. The only difference is which torso
 * goes underneath — see `TORSO_UNDER`.
 */
function garment(...layers: Element[][]): { elements: Element[] } {
  return { elements: [...shirtBody(TORSO), ...layers.flat()] }
}

function coated(...layers: Element[][]): { elements: Element[] } {
  return { elements: [...shirtBody(TORSO_UNDER), ...layers.flat()] }
}

export const CLOTHES_VARIANTS: Record<string, { elements: Element[]; weight: number }> = {
  shirtAndTie: { ...garment(collar, tie), weight: 9 },
  shirtAndBowTie: { ...garment(collar, bow), weight: 3 },
  suit: { ...coated(collar, tie, jacket), weight: 12 },
  suitAndWaistcoat: { ...coated(waistcoat, collar, tie, jacket), weight: 7 },
  suitAndBowTie: { ...coated(collar, bow, jacket), weight: 5 },
  suitAndCravat: { ...coated(collar, cravat, jacket), weight: 4 },
  // The waistcoat worn without a jacket. Worth its own variant because it changes the silhouette rather
  // than the detail: no lapels, so the torso is one dark mass with a shirt V — which is a different
  // figure at 16px, where lapels have long since disappeared.
  waistcoatAndTie: { ...coated(waistcoat, collar, tie), weight: 5 },
  waistcoatAndBowTie: { ...coated(waistcoat, collar, bow), weight: 3 },
  doubleBreastedSuit: { ...coated(collar, tie, doubleBreasted), weight: 5 },
  // Upstream's blazer, worn open — kept because it is the one garment that shipped with the style and
  // still belongs in the room.
  blazer: { ...coated(collar, jacket), weight: 4 },
  gown: { ...coated(collar, gown), weight: 3 },
  gownAndBands: { ...coated(collar, bands, gown), weight: 4 },
  gownAndJabot: { ...coated(collar, jabot, gown), weight: 2 },
  gownAndHood: { ...coated(collar, bands, gown, hood), weight: 3 },
}

/**
 * The same inset, applied to the skin body upstream draws under the clothes.
 *
 * `TORSO_UNDER` only solved half the problem. Under the shirt there is a second shape with the same
 * outline again: the source's own head element carries a torso in `skin`, and its shoulder arcs are
 * r = 72 about (112, 271) and (168, 271) — which, once the clothes' `translate(40 184.7)` is applied,
 * are the clothes' own shoulder centres to within six hundredths of a unit. Three coincident edges, not
 * two.
 *
 * It is the skin one that actually showed. Probed at 200px on black, the boundary pixel of the gown's
 * left shoulder came back (78, 48, 27) — orange, between a black ground and a robe of (34, 32, 29),
 * which no blend of those two can produce. A tan rim around a black gown is a worse artifact than a pale
 * one, and it was there in every garment.
 *
 * The replacement is asserted rather than assumed: `source.g.ts` is generated, and if a regeneration
 * ever changes this path the build should stop rather than quietly ship the halo back.
 */
const SKIN_BODY_SHOULDERS = 'V199h-4a72 72 0 0 0-72 72v9h200v-9a72 72 0 0 0-72-72h-4'
const SKIN_BODY_SHOULDERS_INSET =
  'V199h-4V200.5a70.5 70.5 0 0 0-70.5 70.5v9h197v-9a70.5 70.5 0 0 0-70.5-70.5V199h-4'

export function insetSkinBody(elements: Element[]): Element[] {
  let replaced = 0
  const out = elements.map((element) => {
    if (!('attributes' in element)) return element
    const d = element.attributes?.d
    if (typeof d !== 'string' || !d.includes(SKIN_BODY_SHOULDERS)) return element
    replaced++
    return {
      ...element,
      attributes: { ...element.attributes, d: d.replace(SKIN_BODY_SHOULDERS, SKIN_BODY_SHOULDERS_INSET) },
    }
  })
  if (replaced !== 1) {
    throw new Error(`insetSkinBody: expected exactly one skin body to inset, found ${replaced}`)
  }
  return out
}

// ---------------------------------------------------------------------------------------------------
// top — 260 × 280, placed at translate(8 0). Skull: a 56-unit circle centred at (132, 92).
// ---------------------------------------------------------------------------------------------------

/**
 * Biretta.
 *
 * Everything here is struck from the skull the source actually drew: a 56-unit circle centred at
 * (132, 92). The crown's base is at y = 66, where that circle is 106 wide, and the crown is 108 wide
 * there — so the cap is wider than the head at every height it crosses and no rim of scalp can appear
 * beside it. The base curves *downward* rather than running straight, because a straight edge laid
 * across a dome touches it only at the middle and reads as a plank balanced on a head.
 *
 * The hard part is register of *idiom*, not of geometry. A biretta is an angular object and this style
 * contains no angular objects — the source's nearest neighbour, the turban, is one soft mass with a
 * single highlight. A board 116 units wide with a knob on it read as a lampshade sitting on a person.
 * What fixed it was shrinking the board to 100 (below the head's own 112), rounding its ends to a full
 * pill, and pulling it down onto the crown so the cap is one silhouette rather than a stack of three.
 *
 * Side hair is part of the variant rather than a separate layer: `top` is exclusive in this style, so a
 * cap with no hair under it renders a shaved head and reads as costume rather than as dress.
 */
const biretta: Element[] = [
  /*
   * The hair is a crescent between two arcs concentric with the skull — r = 58 outside it and r = 44
   * inside — so it cannot detach from the head however the cap above it changes. Drawn freehand it came
   * out as a thin dark spike floating clear of the temple, which was the worst defect in the style.
   * Its foot is rounded rather than cut off square: a radial chop across the cheek reads as a shaved
   * sideburn, which is a haircut nobody on this bench has.
   *
   * Its top chord is at y = 74, two units under the crown's own edge where the two meet, so the crown
   * covers the join. At y = 56 — where it sat while the crown rode high — a full fifteen units of hair
   * showed above the temple and the pair read as a swimming cap over a bandana.
   */
  path('M76.9 74A58 58 0 0 0 77.6 112Q81 118 90.3 106A44 44 0 0 1 91.9 74z', HAIR),
  path('M187.1 74A58 58 0 0 1 186.4 112Q183 118 173.7 106A44 44 0 0 0 172.1 74z', HAIR),
  /*
   * The crown, and the whole shape of this variant is in where its base sits.
   *
   * It sat at y = 66 at the sides, which is 26 units below the top of a skull that is 112 across — a cap
   * covering only the crown of the head, with a wide band of hair under it. It read as a shower cap, and
   * on the wall at 112px as a spinning top. The base is now y = 76 at the sides and dips to y = 91 at
   * the centre, three units clear of the brow at 94, so the cap sits ON the head the way a cap does.
   *
   * The dip is the second half of that read. A straight edge laid across a dome touches it only at the
   * middle and reads as a plank balanced on a head; a base that hangs lowest at the centre is a band
   * wrapping the skull, seen level. Because the control point is (132, 106) the horizontal component of
   * that quadratic is exactly linear, so every shading shape below can be split off it arithmetically.
   *
   * The sides are near-cylindrical — 120 across at the base, 92 at the top — rather than the strong cone
   * they were. A cone under a board is a lampshade, and the board then reads as a plate balanced on it.
   */
  path('M82 46h100a5 5 0 0 1 4 3C186 58 188 67 190 76Q132 106 74 76C76 67 78 58 78 49a5 5 0 0 1 4-3z', HAT),
  /*
   * The board oversails the crown rather than being narrower than it, and it is a plate rather than a
   * pill.
   *
   * At 100 wide over a 62-wide crown top it was a mushroom — bottom-heavy, top-heavy and pinched in the
   * middle, which is three objects stacked. Widening it fixed the stack but a 6-unit radius on a 12-unit
   * bar is a full half-round end, and a soft white pill over a flaring crown is a nurse's cap. A
   * biretta's plate is stiff: `rx` is 3.5 on a height of 14, so the corners are eased rather than
   * rolled, and the crown's flare is cut from 14 units a side to 8 so it stops reading as an upturned
   * bucket.
   */
  {
    type: 'element',
    name: 'rect',
    attributes: { x: '74', y: '32', width: '116', height: '14', rx: '3.5', fill: HAT },
  },
  // The tuft, sunk into the board so it is part of the cap rather than a knob on a stalk.
  { type: 'element', name: 'circle', attributes: { cx: '132', cy: '29', r: '6.5', fill: HAT } },
  /*
   * Lit on the left, shaded under the board and down its right — one light direction, as upstream uses.
   *
   * The lit face closes along the crown's own base curve rather than along a guessed one. Its foot is
   * the point of that quadratic at x = 90, and its control point is that quadratic's own control split
   * at the same parameter, so it cannot poke below the cap and print a white sliver on the forehead.
   */
  path('M82 46h14c-1.5 13-3.5 26-6 37.14Q82 80.14 74 76C76 67 78 58 78 49a5 5 0 0 1 4-3z', 'white', {
    'fill-opacity': '.09',
  }),
  shade('M82 46h100l-2 8q-48 5-96 0z', 0.14),
  // Follows the board's own corner radius. Drawn past it with a radius of its own it overshot the plate
  // and hung a grey tab off the right of the brim.
  shade('M132 32h54.5a3.5 3.5 0 0 1 3.5 3.5v7a3.5 3.5 0 0 1-3.5 3.5H132z', 0.1),
]

/**
 * Barrister's wig.
 *
 * One closed path: crown, both side falls, and the hairline cut out of the middle. Because the falls are
 * part of the wig's own outline rather than shapes laid beside it, they cannot drift off the head — the
 * failure mode of drawing three loose curls and hoping.
 *
 * Proportion, not shape, is what makes this read as a wig rather than as a hood, and all four numbers
 * are set against the skull the source drew (a 56-unit circle at (132, 92), brow line at y ≈ 94):
 *
 *   Outer edge   ±68   twelve units proud of the head. At ±78 the head looked shrunken inside it.
 *   Face opening ±46   THE number that matters. At ±34 the wig covered twenty-two units of head on each
 *                      side, swallowing both temples and most of the cheeks, and the face read as a
 *                      small oval set into a large grey egg. At ±46 it laps the temple by ten units and
 *                      the head still looks like a head.
 *   Front edge   y=68  twenty-six units above the brow. At y = 54 a bald dome showed above the face.
 *   Fall foot    y=145 level with the jaw, so the falls end beside the face rather than past it.
 *
 * The path is written with an explicit space at every line wrap. Concatenating "…8-47" with "0-27…"
 * silently produces the number 470 and collapses the whole wig to a hairline, which is what the first
 * draft did and what no amount of reading the code revealed.
 *
 * It carries its own two-value palette. A wig is never ginger, and letting it take `hair` would have
 * produced exactly that.
 */
const WIG_BODY =
  'M132 26c-38 0-68 26-68 64v44a11 11 0 0 0 22 0C86 112 94 68 132 68 170 68 178 112 178 134' +
  'a11 11 0 0 0 22 0V90c0-38-30-64-68-64z'

/**
 * A curl, drawn as a bump on the silhouette rather than as a mark inside it.
 *
 * This is where the wig's identity lives. At 16px the interior is gone and only the outline survives, so
 * a lobed edge is worth more than any amount of internal shading — and at 300px it is what separates a
 * wig from a hood.
 *
 * The radius is a parameter because eight identical circles evenly spaced read as machine-made. Real
 * curls grow toward the foot of the fall, so these do too.
 */
function curlBump(cx: number, cy: number, r: number): Element {
  return { type: 'element', name: 'circle', attributes: { cx: String(cx), cy: String(cy), r: String(r), fill: WIG } }
}

const wig: Element[] = [
  path(WIG_BODY, WIG),
  curlBump(65, 98, 7),
  curlBump(64, 113, 8.5),
  curlBump(64, 129, 9.5),
  curlBump(67, 144, 10),
  curlBump(199, 98, 7),
  curlBump(200, 113, 8.5),
  curlBump(200, 129, 9.5),
  curlBump(197, 144, 10),
  /*
   * One swept highlight over the crown, and one soft shadow where each fall turns away.
   *
   * Set beside upstream's `turban` the flat version was plainly the less resolved drawing: the turban
   * carries a single tapered highlight stroke and reads as a solid object, while this read as a cut-out.
   * The earlier attempt at interior detail failed because it was *rhythmic* — three repeated bars per
   * fall, which nothing upstream does. One asymmetric sweep is the idiom, and it is what was missing.
   *
   * It must also be asymmetric. A symmetric arc across the whole crown, tried first, read as a headband
   * rather than as light; and a paired shadow down the right fall was drawn outside the fall's inner
   * edge and printed a grey patch on the cheek. Both were caught by rendering this beside the turban.
   */
  path('M82 74c6-18 22-32 44-38-18 10-32 24-38 42z', 'white', { 'fill-opacity': '.34' }),
]

export const TOP_ADDITIONS: Record<string, { elements: Element[]; weight: number }> = {
  wig: { elements: wig, weight: 3 },
  biretta: { elements: biretta, weight: 2 },
}

// ---------------------------------------------------------------------------------------------------
// Face — the hard part. See the recipe's note on register.
// ---------------------------------------------------------------------------------------------------

/**
 * Mouths. The source ships twelve, eleven of which are performing an emotion; `serious` is the only one
 * that is not, and one mouth across a whole style makes every avatar the same person.
 *
 * These two are `serious` re-proportioned rather than newly invented: the same rounded bar at the same
 * y, taken wider and thinner for a composed line, and shorter and deeper for a closed one. Both keep the
 * source's black-at-.7, which is what stops them reading as a different hand.
 */
function levelMouth(x: number, y: number, w: number, h: number): Element {
  return {
    type: 'element',
    name: 'rect',
    attributes: {
      x: String(x),
      y: String(y),
      width: String(w),
      height: String(h),
      rx: String(h / 2),
      fill: 'black',
      'fill-opacity': '.7',
    },
  }
}

/**
 * Mouths. Upstream ships twelve and eleven are performing an emotion; `serious` — a rounded bar — is the
 * only one that is not, and one mouth across a whole style makes every avatar the same person.
 *
 * These two are that bar re-proportioned. An earlier `set` was drawn as a lens with curved edges and
 * measured a 2.69-unit downturn at the corners, which reads as displeased and is as wrong as a smile.
 * Both are now rounded rectangles, so top and bottom edges are horizontal and the cant is zero by
 * construction. They differ only in width and weight.
 */
export const MOUTH_ADDITIONS: Record<string, { elements: Element[]; weight: number }> = {
  set: { elements: [levelMouth(31, 12.5, 30, 5)], weight: 4 },
  pressed: { elements: [levelMouth(37, 11, 18, 7)], weight: 3 },
}

/**
 * The two drawn brows, which sit either side of the one upstream brow that survives.
 *
 * Measured, not eyeballed — and the measurement had to be got right before it meant anything. Reading
 * the TOP edge of a rounded bar reports the cap radius as if it were an arch: a level 24x6 rect with
 * rx=3 scores 2.5 that way, and on that faulty metric upstream's `flatNatural` appeared to rise 4.75
 * and an earlier hand-drawn brow here appeared to rise 3.94. Reading the MIDLINE instead, at 15%, 50%
 * and 85% of the span, `flatNatural` measures -0.19 — level — while `angry` tilts 3.63,
 * `raisedExcited` 3.81, `sadConcerned` -3.44 and even `default` 2.16.
 *
 * So `flatNatural` was reinstated: it passes the test, and it is upstream's own hand. These two flank
 * it in weight. Both have a dead-straight top edge, so tilt is zero by construction rather than by care;
 * life comes from the bottom edge, which tapers thick-to-thin from the inner end outward — how a brow
 * actually sits, and a property that carries no emotion.
 */
function brow(x0: number, x1: number, top: number, inner: number, outer: number): Element {
  const r = inner / 2
  const ro = outer / 2
  const mirror = (v: number) => 96.27 - v
  return path(
    `M${x0} ${top} ${x1} ${top}a${r} ${r} 0 0 1 0 ${inner}L${x0} ${top + outer}a${ro} ${ro} 0 0 1 0-${outer}z` +
      `M${mirror(x0)} ${top} ${mirror(x1)} ${top}a${r} ${r} 0 0 0 0 ${inner}L${mirror(x0)} ${top + outer}` +
      `a${ro} ${ro} 0 0 0 0-${outer}z`,
    'black',
    { 'fill-opacity': '.6' },
  )
}

export const EYEBROW_ADDITIONS: Record<string, { elements: Element[]; weight: number }> = {
  level: { elements: [brow(4, 31, 10.4, 6, 2.8)], weight: 5 },
  levelFine: { elements: [brow(5.5, 30, 11, 4.4, 2)], weight: 3 },
}

/*
 * A hooded eye was drawn here and cut, and the reason is worth keeping.
 *
 * It was upstream's own `happy` arc translated seven units up, on the theory that relocating a smile
 * makes it an upper lid. Measured on its own that arc tilts 2.25 units — the same arch as upstream's
 * `default` brow, which this style rejects at 2.16. Moving a curve does not flatten it. On a wall of
 * faces it read as a second, arched brow sitting inside the eye, and it failed the style's own test.
 *
 * Note that measuring the composite shape hid this: pupil-plus-lid scores -0.5, because the pupil
 * dominates the midline. The arc had to be measured alone. A metric that averages a defect away is
 * worse than no metric, because it produces a number that looks like evidence.
 *
 * Cutting it left `eyes` with a single variant, so the component was removed and upstream's pupils are
 * drawn straight onto the canvas instead.
 */
