/**
 * Iconify API client.
 *
 * Iconify normalizes 200+ icon sets behind one interface and — critically for us — exposes a
 * machine-readable SPDX license per set. Every icon comes back as `body` markup on a uniform grid with
 * `currentColor`, which maps cleanly onto DiceBear's colour references.
 *
 * Responses are cached on disk so a normal build never touches the network. Only a recipe that names a
 * new icon forces a fetch.
 */

import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const API = 'https://api.iconify.design'
const CACHE_DIR = join(import.meta.dir, '../../../../.cache/iconify')

/** An icon address in Iconify's `prefix:name` form, e.g. `lucide:scale`. */
export type IconRef = `${string}:${string}`

export interface CollectionLicense {
  title: string
  spdx?: string
  url?: string
}

export interface CollectionMeta {
  name: string
  author?: { name: string; url?: string }
  license?: CollectionLicense
  total?: number
}

export interface FetchedIcon {
  ref: IconRef
  prefix: string
  name: string
  /** Raw SVG markup for the icon's contents, without the wrapping `<svg>` element. */
  body: string
  /** The icon's own viewBox dimensions, already resolved against the set's defaults. */
  width: number
  height: number
}

interface IconifySetResponse {
  prefix: string
  width?: number
  height?: number
  icons?: Record<string, { body: string; width?: number; height?: number }>
  aliases?: Record<string, { parent: string; width?: number; height?: number }>
}

async function readCache<T>(file: string): Promise<T | null> {
  const handle = Bun.file(file)
  if (!(await handle.exists())) return null
  return (await handle.json()) as T
}

async function writeCache(file: string, value: unknown): Promise<void> {
  await mkdir(dirname(file), { recursive: true })
  await Bun.write(file, `${JSON.stringify(value, null, 2)}\n`)
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Iconify request failed: ${response.status} ${response.statusText} — ${url}`)
  }
  return (await response.json()) as T
}

/** Set-level metadata for every collection Iconify knows about, keyed by prefix. */
export async function fetchCollections(): Promise<Record<string, CollectionMeta>> {
  const file = join(CACHE_DIR, 'collections.json')
  const cached = await readCache<Record<string, CollectionMeta>>(file)
  if (cached) return cached

  const collections = await fetchJson<Record<string, CollectionMeta>>(`${API}/collections`)
  await writeCache(file, collections)
  return collections
}

function parseRef(ref: IconRef): { prefix: string; name: string } {
  const separator = ref.indexOf(':')
  if (separator < 1 || separator === ref.length - 1) {
    throw new Error(`Malformed icon reference "${ref}" — expected "prefix:name", e.g. "lucide:scale".`)
  }
  return { prefix: ref.slice(0, separator), name: ref.slice(separator + 1) }
}

/**
 * Fetches every referenced icon, batching one request per set.
 *
 * A per-set cache file accumulates icons across runs, so adding one icon to a recipe re-fetches only
 * that set, and only the icons missing from the cache.
 */
export async function fetchIcons(refs: readonly IconRef[]): Promise<FetchedIcon[]> {
  const byPrefix = new Map<string, Set<string>>()
  for (const ref of refs) {
    const { prefix, name } = parseRef(ref)
    const names = byPrefix.get(prefix) ?? new Set<string>()
    names.add(name)
    byPrefix.set(prefix, names)
  }

  const results: FetchedIcon[] = []

  for (const [prefix, names] of byPrefix) {
    const file = join(CACHE_DIR, `${prefix}.json`)
    const cached = (await readCache<IconifySetResponse>(file)) ?? { prefix, icons: {} }
    const missing = [...names].filter((name) => !cached.icons?.[name])

    let set = cached
    if (missing.length > 0) {
      const fresh = await fetchJson<IconifySetResponse>(
        `${API}/${prefix}.json?icons=${missing.map(encodeURIComponent).join(',')}`,
      )
      set = {
        ...fresh,
        icons: { ...cached.icons, ...fresh.icons },
        aliases: { ...cached.aliases, ...fresh.aliases },
      }
      await writeCache(file, set)
    }

    for (const name of names) {
      // Iconify resolves aliases only when the alias itself was requested, so follow one hop by hand.
      const alias = set.aliases?.[name]
      const icon = set.icons?.[name] ?? (alias ? set.icons?.[alias.parent] : undefined)
      if (!icon) {
        throw new Error(`Icon "${prefix}:${name}" not found in set "${prefix}".`)
      }
      results.push({
        ref: `${prefix}:${name}`,
        prefix,
        name,
        body: icon.body,
        width: icon.width ?? alias?.width ?? set.width ?? 24,
        height: icon.height ?? alias?.height ?? set.height ?? 24,
      })
    }
  }

  return results
}
