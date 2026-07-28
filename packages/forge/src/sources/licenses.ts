/**
 * License gate.
 *
 * The whole point of replacing an off-the-shelf DiceBear style is to stop inheriting attribution
 * obligations we did not choose. So every icon that enters the pipeline must come from a set whose SPDX
 * identifier is on the allowlist, and the build fails otherwise — silently shipping a CC-BY icon would
 * reintroduce exactly the problem this project exists to solve.
 */

import { FILE_PREFIX } from './files.ts'
import type { CollectionMeta, FetchedIcon, IconRef } from './iconify.ts'

/**
 * Permissive licenses only. Apache-2.0 is allowed but obliges us to ship a NOTICE, which `emit`
 * generates; anything requiring per-use attribution (CC-BY and friends) is rejected outright.
 */
export const ALLOWED_SPDX = ['MIT', 'ISC', 'Apache-2.0', 'CC0-1.0', 'Unlicense'] as const

export type AllowedSpdx = (typeof ALLOWED_SPDX)[number]

const NOTICE_REQUIRED: readonly string[] = ['Apache-2.0']

export interface Attribution {
  prefix: string
  setName: string
  spdx: AllowedSpdx
  licenseUrl?: string
  author?: string
  authorUrl?: string
  /** Sorted `prefix:name` refs actually used from this set. */
  icons: IconRef[]
  requiresNotice: boolean
}

export class LicenseError extends Error {
  override name = 'LicenseError'
}

/**
 * Verifies every set behind the fetched icons and returns the attribution records for the sets that
 * were actually used. Throws on the first violation, listing all of them.
 */
export function collectAttributions(
  icons: readonly FetchedIcon[],
  collections: Record<string, CollectionMeta>,
): Attribution[] {
  const violations: string[] = []
  const byPrefix = new Map<string, Attribution>()

  for (const icon of icons) {
    // Artwork drawn in this repository carries the project's own license; there is nothing to attribute.
    if (icon.prefix === FILE_PREFIX) continue

    const meta = collections[icon.prefix]
    if (!meta) {
      violations.push(`${icon.ref}: set "${icon.prefix}" is unknown to Iconify — cannot verify its license.`)
      continue
    }

    const spdx = meta.license?.spdx
    if (!spdx) {
      violations.push(`${icon.ref}: set "${icon.prefix}" declares no SPDX identifier.`)
      continue
    }
    if (!(ALLOWED_SPDX as readonly string[]).includes(spdx)) {
      violations.push(
        `${icon.ref}: set "${icon.prefix}" is ${spdx}, which is not on the allowlist (${ALLOWED_SPDX.join(', ')}).`,
      )
      continue
    }

    const existing = byPrefix.get(icon.prefix)
    if (existing) {
      existing.icons.push(icon.ref)
      continue
    }
    byPrefix.set(icon.prefix, {
      prefix: icon.prefix,
      setName: meta.name,
      spdx: spdx as AllowedSpdx,
      licenseUrl: meta.license?.url,
      author: meta.author?.name,
      authorUrl: meta.author?.url,
      icons: [icon.ref],
      requiresNotice: NOTICE_REQUIRED.includes(spdx),
    })
  }

  if (violations.length > 0) {
    throw new LicenseError(`Disallowed icon sources:\n  - ${violations.join('\n  - ')}`)
  }

  // Deterministic ordering keeps ATTRIBUTION.md diffs meaningful.
  for (const attribution of byPrefix.values()) {
    attribution.icons = [...new Set(attribution.icons)].sort()
  }
  return [...byPrefix.values()].sort((a, b) => a.prefix.localeCompare(b.prefix))
}
