/**
 * License guards.
 *
 * These run entirely against committed files. A check that needs the network is a check that gets
 * skipped in CI, and the one obligation this project cannot afford to get wrong is the licensing of
 * the artwork it ships.
 */

import { describe, expect, test } from 'bun:test'
import { join } from 'node:path'
import { renderAttribution, renderNotice } from '../packages/forge/src/emit/index.ts'
import { ALLOWED_SPDX, type Attribution } from '../packages/forge/src/index.ts'
import sources from '../packages/core/src/styles/sources.json' with { type: 'json' }

const ROOT = join(import.meta.dir, '..')
const provenance = sources as Attribution[]

describe('provenance', () => {
  // An empty record is the ideal state, not a failure: it means every mark in the style was drawn here
  // and the project carries no third-party obligation at all. The guarantee that matters is conditional
  // — whatever is listed must be permissive.
  test('every source set is permissively licensed', () => {
    for (const attribution of provenance) {
      expect(ALLOWED_SPDX).toContain(attribution.spdx)
    }
  })

  test('every source set names its icons', () => {
    for (const attribution of provenance) {
      expect(attribution.icons.length).toBeGreaterThan(0)
    }
  })
})

describe('generated license files are current', () => {
  test('ATTRIBUTION.md matches the recorded provenance', async () => {
    const committed = await Bun.file(join(ROOT, 'ATTRIBUTION.md')).text()

    expect(committed).toBe(renderAttribution(provenance))
  })

  test('NOTICE matches the recorded provenance', async () => {
    const file = Bun.file(join(ROOT, 'NOTICE'))
    const committed = (await file.exists()) ? await file.text() : ''

    expect(committed).toBe(renderNotice(provenance))
  })
})
