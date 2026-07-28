/**
 * lexavataaars — deterministic avatars for legal software.
 *
 * A thin wrapper over `@dicebear/core`. The style itself is a plain DiceBear definition, which means
 * everything in their ecosystem — the CLI, the PNG converter, the language ports — works against it
 * unchanged. This module exists only to reuse the parsed style and to pick better defaults.
 */

import { Avatar, Style, type StyleOptions } from '@dicebear/core'
import definition from './styles/lexavataaars.json' with { type: 'json' }

/**
 * The style definition.
 *
 * Exported so consumers can hand it to the DiceBear CLI or a non-JavaScript port. Constructing a
 * `Style` validates the definition, so it is done once here and shared across every avatar.
 */
export { definition as styleDefinition }

const style = new Style(definition)

export type LexavatarsOptions = StyleOptions<typeof definition>

export interface CreateAvatarOptions extends LexavatarsOptions {
  /** Identity the avatar is derived from. The same seed always produces the same avatar. */
  seed: string
}

const VARIANTS: Record<string, string[]> = Object.fromEntries(
  Object.entries(definition.components as Record<string, { variants: Record<string, unknown> }>).map(
    ([component, spec]) => [`${component}Variant`, Object.keys(spec.variants)],
  ),
)

/**
 * Rejects a variant name the style does not have.
 *
 * DiceBear treats an unrecognised variant as "no match" and drops the whole component: pinning
 * `clothesVariant: 'gownAndJabot'` after that garment was cut renders a figure with no clothes at all —
 * no error, no warning, no fallback, just a bare torso. That is the worst shape a mistake can take,
 * because it survives every check a consumer is likely to run and only shows up in front of a user.
 *
 * It is a real upgrade hazard rather than a hypothetical one: `gownAndJabot` shipped in 0.2.0 and is
 * gone in 0.3.0, so anyone who pinned it hits exactly this. Since variant names are the one part of the
 * API a consumer types by hand, checking them here costs a set lookup and converts a silent visual bug
 * into a message that names the mistake.
 *
 * Only names the definition does not contain are rejected, so nothing that renders today stops
 * rendering. The check lives in this wrapper and not in the definition, which stays a plain DiceBear
 * style that their CLI and the language ports consume unchanged.
 */
function assertKnownVariants(options: Record<string, unknown>): void {
  for (const [option, value] of Object.entries(options)) {
    const known = VARIANTS[option]
    if (!known || value == null) continue
    for (const name of Array.isArray(value) ? value : [value]) {
      if (typeof name === 'string' && !known.includes(name)) {
        throw new Error(
          `lexavataaars: unknown ${option} ${JSON.stringify(name)}. ` +
            `Available: ${known.join(', ')}. ` +
            `DiceBear would silently render no ${option.replace(/Variant$/, '')} instead.`,
        )
      }
    }
  }
}

/**
 * Renders an avatar.
 *
 * `idRandomization` defaults to on: without it, two avatars on the same page share internal SVG `id`s
 * for gradients and masks, and the second silently repaints the first.
 */
export function createAvatar({ seed, ...options }: CreateAvatarOptions): Avatar {
  assertKnownVariants(options as Record<string, unknown>)

  return new Avatar(style, {
    idRandomization: true,
    ...options,
    seed,
  } as LexavatarsOptions)
}

export { Avatar, Style }
