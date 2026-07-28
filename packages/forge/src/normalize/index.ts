/**
 * SVG markup → DiceBear element tree.
 *
 * Iconify hands us `body` markup: a string of SVG on a uniform grid, coloured with `currentColor`.
 * DiceBear wants a validated node tree with colours expressed as references into the definition's
 * palette. This module is the bridge, and it is a pure function — no network, no filesystem — so the
 * tricky parts (nested groups, stroke unification, colour substitution) are cheap to test.
 *
 * Coordinates are deliberately left in the source grid. Placement onto the canvas happens later via a
 * `transform` on the component reference, which is both more accurate and more readable than rewriting
 * path data.
 */

import { parseSync } from 'svgson'
import type { Element, GenericElement } from '../definition.ts'
import { ALLOWED_ATTRIBUTES, ALLOWED_ELEMENTS } from './allowlist.ts'

export interface NormalizeOptions {
  /**
   * Palette entry that replaces `currentColor` and any other stroke/fill the icon paints itself with.
   * This is what turns a static icon into something the PRNG can recolour.
   */
  colorName: string
  /** Stroke width in source-grid units, applied uniformly so icons from different sets match. */
  strokeWidth?: number
  strokeLinecap?: 'butt' | 'round' | 'square'
  strokeLinejoin?: 'miter' | 'round' | 'bevel'
}

/** Attribute values that mean "paint this with the icon's own colour" rather than a literal colour. */
const DYNAMIC_COLOR_VALUES = new Set(['currentcolor', 'currentColor'])

const PAINT_ATTRIBUTES = new Set(['fill', 'stroke'])

interface SvgsonNode {
  name: string
  type: string
  value: string
  attributes: Record<string, string>
  children: SvgsonNode[]
}

export class NormalizeError extends Error {
  override name = 'NormalizeError'
}

/**
 * Converts one icon body into element nodes.
 *
 * Anything the schema would reject is dropped rather than escalated: icon sets carry stray `xmlns`,
 * `data-*` and editor metadata that is harmless to lose. A disallowed *element*, by contrast, would
 * silently change the artwork, so that throws.
 */
export function normalizeIconBody(body: string, options: NormalizeOptions): Element[] {
  const {
    colorName,
    strokeWidth,
    strokeLinecap = 'round',
    strokeLinejoin = 'round',
  } = options

  // svgson needs a single root; icon bodies routinely have several top-level nodes.
  const root = parseSync(`<svg>${body}</svg>`) as SvgsonNode
  return root.children.flatMap((child) => convert(child, { colorName, strokeWidth, strokeLinecap, strokeLinejoin }))
}

type ResolvedOptions = Required<Pick<NormalizeOptions, 'colorName' | 'strokeLinecap' | 'strokeLinejoin'>> &
  Pick<NormalizeOptions, 'strokeWidth'>

function convert(node: SvgsonNode, options: ResolvedOptions): Element[] {
  if (node.type === 'text') {
    const value = node.value.trim()
    return value ? [{ type: 'text', value }] : []
  }

  if (node.type === 'comment') return []

  if (!ALLOWED_ELEMENTS.has(node.name)) {
    throw new NormalizeError(
      `SVG element <${node.name}> is not permitted by the DiceBear definition schema. ` +
        'Replace the icon or pre-process it before ingest.',
    )
  }

  const element: GenericElement = {
    type: 'element',
    name: node.name,
    attributes: convertAttributes(node.attributes, options),
  }

  const children = node.children.flatMap((child) => convert(child, options))
  if (children.length > 0) element.children = children

  // Keep the node lean so emitted JSON stays diffable.
  if (Object.keys(element.attributes ?? {}).length === 0) delete element.attributes

  return [element]
}

function convertAttributes(
  attributes: Record<string, string>,
  options: ResolvedOptions,
): GenericElement['attributes'] {
  const result: NonNullable<GenericElement['attributes']> = {}

  for (const [name, value] of Object.entries(attributes)) {
    if (!ALLOWED_ATTRIBUTES.has(name)) continue

    if (PAINT_ATTRIBUTES.has(name)) {
      // `none` is structural — it distinguishes an outlined shape from a filled one, so it must survive.
      if (value === 'none' || value === 'transparent') {
        result[name] = value
        continue
      }
      // Everything else the icon paints becomes a palette reference, whether it was `currentColor` or a
      // hard-coded hex from a set that does not use `currentColor`.
      result[name] = { type: 'color', name: options.colorName }
      continue
    }

    result[name] = value
  }

  // Unify stroke rendering so icons from different sets sit together without looking assembled.
  if (result.stroke !== undefined && result.stroke !== 'none') {
    if (options.strokeWidth !== undefined) result['stroke-width'] = String(options.strokeWidth)
    result['stroke-linecap'] = options.strokeLinecap
    result['stroke-linejoin'] = options.strokeLinejoin
  }

  return result
}

export { DYNAMIC_COLOR_VALUES }
