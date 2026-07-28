/**
 * Recipe types — the authoring surface for a style.
 *
 * A recipe is the design intent expressed as data: which icons become which variants, how they are
 * placed, what the palette is. Everything visual lives here, so tuning the look never means touching
 * pipeline code.
 *
 * Component and colour names are not private implementation detail: DiceBear derives its render options
 * from them (`motif` → `motifVariant`, `field` → `fieldColor`). Renaming one is a breaking change for
 * consumers, so choose them as carefully as any public API.
 */

import type { ColorGroup, Element, Range } from '../definition.ts'
import type { IconRef } from '../sources/iconify.ts'

/** Stroke treatment, in the source artwork's own grid units. */
export interface StrokeSpec {
  width?: number
  linecap?: 'butt' | 'round' | 'square'
  linejoin?: 'miter' | 'round' | 'bevel'
}

/** A component whose variants are sourced from icon sets. */
export interface IconComponentSpec {
  source: 'icons'
  /** Variant name (camelCase, becomes part of the public API) → icon address. */
  variants: Record<string, IconRef>
  /** Palette entry the artwork is painted with. */
  colorName: string
  /**
   * Overrides the recipe's stroke for this component.
   *
   * Needed whenever a component is placed at a very different size from the rest: stroke width is
   * expressed in source-grid units, so a device shrunk to a fifth of the canvas keeps only a fifth of its
   * apparent line weight and thins away to nothing.
   */
  stroke?: StrokeSpec
  /** 0–100. Omitted means the component always renders. */
  probability?: number
  rotate?: Range
  scale?: Range
  translate?: { x?: Range; y?: Range }
  /** Per-variant selection weights and tags, keyed by variant name. */
  variantMeta?: Record<string, { weight?: number; tags?: string[] }>
}

/** A component whose variants are authored directly as element trees. */
export interface InlineComponentSpec {
  source: 'inline'
  width: number
  height: number
  variants: Record<string, { elements: Element[]; weight?: number; tags?: string[] }>
  probability?: number
  rotate?: Range
  scale?: Range
  translate?: { x?: Range; y?: Range }
}

export type ComponentSpec = IconComponentSpec | InlineComponentSpec

export interface Recipe {
  /** Style name; also the emitted filename. */
  name: string
  canvas: { width: number; height: number }
  meta: {
    license: { name: string; url?: string }
    creator: { name: string; url?: string }
    source: { name: string; url?: string }
  }
  /** Stroke treatment applied uniformly to every ingested icon, in source-grid units. */
  stroke: {
    width?: number
    linecap?: 'butt' | 'round' | 'square'
    linejoin?: 'miter' | 'round' | 'bevel'
  }
  colors: Record<string, ColorGroup>
  components: Record<string, ComponentSpec>
  /**
   * The root element tree. Built by a function rather than stated as data so placement can be computed
   * from the canvas and component dimensions instead of hand-tuned magic numbers.
   */
  canvasElements: (helpers: CanvasHelpers) => Element[]
}

export interface CanvasHelpers {
  canvas: { width: number; height: number }
  /** Natural dimensions of a declared component, for computing placement. */
  sizeOf: (component: string) => { width: number; height: number }
  /**
   * Places a component so it occupies `size` units centred on (`cx`, `cy`), defaulting to the middle of
   * the canvas. Emits a component reference carrying the corresponding transform.
   */
  place: (component: string, options?: { size?: number; cx?: number; cy?: number }) => Element
}

export function isIconComponent(spec: ComponentSpec): spec is IconComponentSpec {
  return spec.source === 'icons'
}
