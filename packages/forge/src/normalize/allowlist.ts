/**
 * Element and attribute allowlists, read straight out of `@dicebear/schema`.
 *
 * Deriving these instead of copying them means a schema bump can never leave the pipeline emitting
 * markup the renderer rejects — and it keeps one source of truth for what "safe SVG" means here.
 */

import schema from '@dicebear/schema/definition.json' with { type: 'json' }

interface DefinitionSchema {
  definitions: {
    genericElement: { properties: { name: { enum: string[] } } }
    attributes: { properties: Record<string, unknown> }
  }
}

const definitions = (schema as unknown as DefinitionSchema).definitions

/** SVG tag names the definition format permits. */
export const ALLOWED_ELEMENTS: ReadonlySet<string> = new Set(
  definitions.genericElement.properties.name.enum,
)

/** SVG attributes the definition format permits. Event handlers and namespaced attributes are absent. */
export const ALLOWED_ATTRIBUTES: ReadonlySet<string> = new Set(
  Object.keys(definitions.attributes.properties),
)
