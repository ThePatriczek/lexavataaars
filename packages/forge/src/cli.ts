#!/usr/bin/env bun
/**
 * `bun run forge` — sources → normalize → compose → emit.
 *
 * Writes the generated definition into `packages/core`, which is committed. Consumers therefore build
 * without ever contacting Iconify; only changing a recipe requires the network.
 */

import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { compose, iconRefsOf } from './compose/index.ts'
import type { Recipe } from './compose/recipe.ts'
import {
  validateDefinition,
  writeAttribution,
  writeDefinition,
  writeNotice,
  writeProvenance,
} from './emit/index.ts'
import { isFileRef, loadFileIcons } from './sources/files.ts'
import { fetchCollections, fetchIcons } from './sources/iconify.ts'
import { collectAttributions } from './sources/licenses.ts'

const ROOT = join(import.meta.dir, '../../..')
const ASSETS = join(ROOT, 'assets')
const RECIPES_DIR = join(ROOT, 'recipes')

/**
 * Every `*.recipe.ts` in `recipes/`, in a stable order.
 *
 * Discovered rather than listed, so adding a style is one new file and never an edit to this one.
 */
async function loadRecipes(): Promise<Recipe[]> {
  const files = (await readdir(RECIPES_DIR)).filter((file) => file.endsWith('.recipe.ts')).sort()

  return Promise.all(
    files.map(async (file) => {
      const module = (await import(join(RECIPES_DIR, file))) as { default?: Recipe }
      if (!module.default) throw new Error(`Recipe "${file}" has no default export.`)
      return module.default
    }),
  )
}

async function main(): Promise<void> {
  const RECIPES = await loadRecipes()
  const collections = await fetchCollections()
  const allAttributions = []

  for (const recipe of RECIPES) {
    const refs = iconRefsOf(recipe)
    const fileRefs = refs.filter(isFileRef)
    const remoteRefs = refs.filter((ref) => !isFileRef(ref))
    console.log(
      `▸ ${recipe.name}: ${remoteRefs.length} icon${remoteRefs.length === 1 ? '' : 's'}` +
        (fileRefs.length > 0 ? `, ${fileRefs.length} local asset${fileRefs.length === 1 ? '' : 's'}` : ''),
    )

    const icons = [...(await fetchIcons(remoteRefs)), ...(await loadFileIcons(fileRefs, ASSETS))]
    // Licensing is checked before anything is written, so a rejected source can never reach the output.
    allAttributions.push(...collectAttributions(icons, collections))

    const definition = compose(recipe, icons)
    validateDefinition(definition)

    const target = join(ROOT, 'packages/core/src/styles', `${recipe.name}.json`)
    await writeDefinition(target, definition)

    const variantCount = Object.values(definition.components ?? {}).reduce(
      (total, component) => total + ('variants' in component ? Object.keys(component.variants).length : 0),
      0,
    )
    console.log(`  ✓ ${Object.keys(definition.components ?? {}).length} components, ${variantCount} variants`)
  }

  const merged = mergeAttributions(allAttributions)
  await writeProvenance(join(ROOT, 'packages/core/src/styles/sources.json'), merged)
  await writeAttribution(join(ROOT, 'ATTRIBUTION.md'), merged)
  const noticeWritten = await writeNotice(join(ROOT, 'NOTICE'), merged)

  console.log(`▸ attribution: ${merged.length} source set${merged.length === 1 ? '' : 's'}`)
  if (noticeWritten) console.log('  ✓ NOTICE written (Apache-2.0 sources in use)')
}

/** Folds per-recipe records into one entry per icon set. */
function mergeAttributions(attributions: readonly Awaited<ReturnType<typeof collectAttributions>>[number][]) {
  const byPrefix = new Map<string, (typeof attributions)[number]>()
  for (const attribution of attributions) {
    const existing = byPrefix.get(attribution.prefix)
    if (!existing) {
      byPrefix.set(attribution.prefix, { ...attribution, icons: [...attribution.icons] })
      continue
    }
    existing.icons = [...new Set([...existing.icons, ...attribution.icons])].sort()
  }
  return [...byPrefix.values()].sort((a, b) => a.prefix.localeCompare(b.prefix))
}

await main()
