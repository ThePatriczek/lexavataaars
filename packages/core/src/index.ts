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

/**
 * Renders an avatar.
 *
 * `idRandomization` defaults to on: without it, two avatars on the same page share internal SVG `id`s
 * for gradients and masks, and the second silently repaints the first.
 */
export function createAvatar({ seed, ...options }: CreateAvatarOptions): Avatar {
  return new Avatar(style, {
    idRandomization: true,
    ...options,
    seed,
  } as LexavatarsOptions)
}

export { Avatar, Style }
