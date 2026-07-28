/**
 * Procedural ornament.
 *
 * This is where the style stops being "an icon on a coloured square" and starts having an idea of its
 * own. The vocabulary here is borrowed from security printing — the guilloché rosettes on banknotes and
 * share certificates, the milled edge of a seal, the tick ring of a notarial stamp. It is the visual
 * language of documents that are meant to be trusted, which is exactly the register a legal product
 * wants and exactly what no icon set will give you.
 *
 * Everything is a pure function of its parameters: same inputs, same path data, byte for byte. That
 * matters because these paths are baked into a committed definition, and a generator that drifted would
 * produce a noisy diff on every build.
 */

const TAU = Math.PI * 2

/** Path coordinates are rounded hard — three decimals is far below a pixel, and it keeps files small. */
function round(value: number): number {
  return Math.round(value * 1e3) / 1e3
}

function greatestCommonDivisor(a: number, b: number): number {
  return b === 0 ? a : greatestCommonDivisor(b, a % b)
}

function toPath(points: readonly (readonly [number, number])[], close = true): string {
  if (points.length === 0) return ''
  const [first, ...rest] = points as [readonly [number, number], ...(readonly [number, number])[]]
  const head = `M${round(first[0])} ${round(first[1])}`
  const tail = rest.map(([x, y]) => `L${round(x)} ${round(y)}`).join('')
  return `${head}${tail}${close ? 'Z' : ''}`
}

export interface GuillocheOptions {
  /** Radius of the fixed outer circle. */
  outer: number
  /** Radius of the rolling inner circle. Its ratio to `outer` sets the number of lobes. */
  inner: number
  /** Distance of the tracing point from the rolling circle's centre. Controls how deep the lobes cut. */
  offset: number
  cx?: number
  cy?: number
  /** Samples per full turn. Higher is smoother and larger. */
  resolution?: number
}

/**
 * A hypotrochoid — the spirograph curve, and the basic unit of engine-turned ornament.
 *
 * The curve closes after `inner / gcd(outer, inner)` turns, so the period is computed rather than
 * guessed; sampling a fixed number of turns would leave a visible seam where the path fails to meet.
 */
export function guilloche({
  outer,
  inner,
  offset,
  cx = 50,
  cy = 50,
  resolution = 240,
}: GuillocheOptions): string {
  const turns = inner / greatestCommonDivisor(Math.round(outer), Math.round(inner))
  const steps = Math.max(64, Math.round(resolution * turns))
  const difference = outer - inner
  const ratio = difference / inner

  const points: [number, number][] = []
  for (let step = 0; step < steps; step += 1) {
    const t = (step / steps) * TAU * turns
    points.push([
      cx + difference * Math.cos(t) + offset * Math.cos(ratio * t),
      cy + difference * Math.sin(t) - offset * Math.sin(ratio * t),
    ])
  }
  return toPath(points)
}

export interface RosetteOptions {
  /** Radius of the ring the petal circles sit on. */
  radius: number
  /** Radius of each petal circle. */
  petal: number
  count: number
  cx?: number
  cy?: number
  /** Rotation of the whole figure, in degrees. */
  phase?: number
}

/**
 * A ring of overlapping circles — the other classic engine-turned figure.
 *
 * Where the hypotrochoid is a single continuous line, this reads as a crisp lattice, which survives
 * being scaled down far better. Emitted as one path so it stays a single element.
 */
export function rosette({ radius, petal, count, cx = 50, cy = 50, phase = 0 }: RosetteOptions): string {
  const segments: string[] = []
  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * TAU + (phase * Math.PI) / 180
    const x = cx + radius * Math.cos(angle)
    const y = cy + radius * Math.sin(angle)
    // Two arcs make a full circle; a single arc of 360° is degenerate and renders as nothing.
    segments.push(
      `M${round(x - petal)} ${round(y)}` +
        `a${round(petal)} ${round(petal)} 0 1 0 ${round(petal * 2)} 0` +
        `a${round(petal)} ${round(petal)} 0 1 0 ${round(-petal * 2)} 0`,
    )
  }
  return segments.join('')
}

export interface SealOptions {
  radius: number
  /** How far the edge deviates from a true circle. Small values read as pressed wax, large as a flower. */
  amplitude: number
  /** Number of lobes around the edge. */
  lobes: number
  cx?: number
  cy?: number
  phase?: number
  resolution?: number
}

/**
 * The milled, slightly irregular edge of a pressed seal.
 *
 * A plain circle reads as UI; this reads as something that was stamped. Deterministic rather than
 * randomised — the irregularity comes from harmonics, not noise, so it stays clean at small sizes.
 */
export function sealEdge({
  radius,
  amplitude,
  lobes,
  cx = 50,
  cy = 50,
  phase = 0,
  resolution = 360,
}: SealOptions): string {
  const points: [number, number][] = []
  for (let step = 0; step < resolution; step += 1) {
    const t = (step / resolution) * TAU
    // A second, weaker harmonic keeps the outline from looking like a perfect cog.
    const r = radius + amplitude * Math.cos(lobes * t + phase) + amplitude * 0.28 * Math.cos(lobes * 2 * t)
    points.push([cx + r * Math.cos(t), cy + r * Math.sin(t)])
  }
  return toPath(points)
}

export interface TickRingOptions {
  radius: number
  /** Length of each tick, drawn inward from `radius`. */
  length: number
  count: number
  cx?: number
  cy?: number
  phase?: number
}

/** The graduated ring of a notarial or court stamp. */
export function tickRing({ radius, length, count, cx = 50, cy = 50, phase = 0 }: TickRingOptions): string {
  const segments: string[] = []
  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * TAU + (phase * Math.PI) / 180
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    segments.push(
      `M${round(cx + radius * cos)} ${round(cy + radius * sin)}` +
        `L${round(cx + (radius - length) * cos)} ${round(cy + (radius - length) * sin)}`,
    )
  }
  return segments.join('')
}

export interface LaidLinesOptions {
  /** Vertical extent of the ruled block. */
  from: number
  to: number
  /** Horizontal extent of each rule. */
  left: number
  right: number
  gap: number
}

/**
 * A ring-shaped region, as a single even-odd path.
 *
 * Used as a clip. Ornament that is allowed to cross the middle of the plate draws lines over the face;
 * confining it to the halo between the portrait and the rim is what turns a spirograph from a cobweb
 * into an engine-turned border. A `clipPath` with two circles would union them, so the hole has to come
 * from one path with `clip-rule="evenodd"`.
 */
export function annulus(outer: number, inner: number, cx = 50, cy = 50): string {
  const arc = (r: number) =>
    `M${round(cx)} ${round(cy - r)}` +
    `A${round(r)} ${round(r)} 0 1 0 ${round(cx)} ${round(cy + r)}` +
    `A${round(r)} ${round(r)} 0 1 0 ${round(cx)} ${round(cy - r)}Z`
  return `${arc(outer)}${arc(inner)}`
}

/** Hairlines at a fixed pitch — laid paper, or the ruled block of a legal pad. */
export function laidLines({ from, to, left, right, gap }: LaidLinesOptions): string {
  const segments: string[] = []
  for (let y = from; y <= to; y += gap) {
    segments.push(`M${round(left)} ${round(y)}L${round(right)} ${round(y)}`)
  }
  return segments.join('')
}
