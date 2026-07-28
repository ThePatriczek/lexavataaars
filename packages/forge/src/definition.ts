/**
 * TypeScript mirror of the DiceBear style-definition format.
 *
 * Authoritative source is `@dicebear/schema` (definition.json, Draft 2020-12); this file exists so the
 * pipeline gets compile-time safety while building a definition. `emit` still validates the finished
 * object against the real schema — these types are a convenience, not the contract.
 */

/** A reference to a named entry in the definition's `colors` map, resolved by the PRNG at render time. */
export interface ColorReference {
  type: 'color'
  name: string
}

export type AttributeValue = string | ColorReference

export interface GenericElement {
  type: 'element'
  name: string
  attributes?: Record<string, AttributeValue>
  children?: Element[]
}

export interface TextElement {
  type: 'text'
  value: string
}

/**
 * Renders a component from the `components` map at this position in the tree.
 *
 * `attributes` land on the generated `<use>` tag — most usefully a `transform`, which is how a
 * component gets positioned and scaled onto the canvas.
 */
export interface ComponentReference {
  type: 'component'
  name: string
  attributes?: Record<string, AttributeValue>
}

export interface StyleElement {
  type: 'element'
  name: 'style'
  children?: TextElement[]
}

export type Element = GenericElement | TextElement | ComponentReference | StyleElement

export interface Range {
  min: number
  max: number
  step?: number
}

export interface Variant {
  elements: Element[]
  /** Relative selection likelihood. Omitted means 1. */
  weight?: number
  /** `category` or `category:value`, both camelCase. Consumed by the `tags` render option. */
  tags?: string[]
}

export interface Component {
  width: number
  height: number
  variants: Record<string, Variant>
  /** 0–100. Omitted means always rendered. */
  probability?: number
  rotate?: Range
  scale?: Range
  translate?: { x?: Range; y?: Range }
}

/** A second, independently randomized instance of another component. */
export interface ComponentAlias {
  extends: string
}

export interface ColorGroup {
  values: string[]
  /** Names of other groups this one must not match. */
  notEqualTo?: string[]
  /** Name of another group; picks the highest-contrast value against it instead of using the PRNG. */
  contrastTo?: string
}

export interface Definition {
  $schema?: string
  $id?: string
  $comment?: string
  meta?: {
    license?: { name: string; url?: string; text?: string }
    creator?: { name: string; url?: string }
    source?: { name: string; url?: string }
  }
  canvas: {
    width: number
    height: number
    elements: Element[]
  }
  components?: Record<string, Component | ComponentAlias>
  colors?: Record<string, ColorGroup>
  attributes?: Record<string, AttributeValue>
}

export function isComponentAlias(value: Component | ComponentAlias): value is ComponentAlias {
  return 'extends' in value
}
