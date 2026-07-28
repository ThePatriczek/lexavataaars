/**
 * Hand-drawn artwork from `assets/`.
 *
 * Addressed as `file:name.svg` so it flows through exactly the same path as an Iconify icon: same
 * normalization, same stroke unification, same colour substitution, same grid-consistency check. Custom
 * artwork that bypassed those rules would be the fastest way to make the style look assembled.
 */

import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { parseSync } from 'svgson'
import type { FetchedIcon, IconRef } from './iconify.ts'

/** Reserved prefix for artwork that lives in this repository rather than an icon set. */
export const FILE_PREFIX = 'file'

interface SvgsonNode {
  name: string
  type: string
  value: string
  attributes: Record<string, string>
  children: SvgsonNode[]
}

export class AssetError extends Error {
  override name = 'AssetError'
}

export function isFileRef(ref: IconRef): boolean {
  return ref.startsWith(`${FILE_PREFIX}:`)
}

function stringify(node: SvgsonNode): string {
  if (node.type === 'text') return node.value
  const attributes = Object.entries(node.attributes)
    .map(([name, value]) => ` ${name}="${value}"`)
    .join('')
  const children = node.children.map(stringify).join('')
  return children ? `<${node.name}${attributes}>${children}</${node.name}>` : `<${node.name}${attributes}/>`
}

/**
 * Reads the referenced assets and returns them in the same shape as fetched icons.
 *
 * Dimensions come from `viewBox` rather than `width`/`height`, because the former describes the
 * coordinate space the path data actually lives in — the latter is just a default display size.
 */
export async function loadFileIcons(refs: readonly IconRef[], assetsDir: string): Promise<FetchedIcon[]> {
  const icons: FetchedIcon[] = []

  for (const ref of refs) {
    if (!isFileRef(ref)) continue
    const name = ref.slice(FILE_PREFIX.length + 1)
    const path = join(assetsDir, name)
    const file = Bun.file(path)

    if (!(await file.exists())) {
      const available = await readdir(assetsDir).catch(() => [])
      throw new AssetError(
        `Asset "${name}" not found in ${assetsDir}.` +
          (available.length > 0 ? ` Available: ${available.join(', ')}.` : ' The directory is empty.'),
      )
    }

    const root = parseSync(await file.text()) as SvgsonNode
    if (root.name !== 'svg') {
      throw new AssetError(`Asset "${name}" must have an <svg> root element, found <${root.name}>.`)
    }

    const viewBox = root.attributes.viewBox
    if (!viewBox) {
      throw new AssetError(`Asset "${name}" has no viewBox. Add one so its coordinate space is unambiguous.`)
    }
    const [, , width, height] = viewBox.trim().split(/[\s,]+/).map(Number)
    if (!width || !height || Number.isNaN(width) || Number.isNaN(height)) {
      throw new AssetError(`Asset "${name}" has a malformed viewBox: "${viewBox}".`)
    }

    icons.push({
      ref,
      prefix: FILE_PREFIX,
      name,
      body: root.children.map(stringify).join(''),
      width,
      height,
    })
  }

  return icons
}
