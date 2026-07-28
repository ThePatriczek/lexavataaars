/**
 * Guards on the committed style definition.
 *
 * These run against the generated artifact rather than the pipeline, because that artifact is what
 * consumers actually install — a definition that validates in `forge` but was committed stale would
 * still break them.
 */

import { describe, expect, test } from 'bun:test'
import { createAvatar, styleDefinition } from '../packages/core/src/index.ts'
import { validateDefinition } from '../packages/forge/src/emit/index.ts'

const SEEDS = Array.from({ length: 200 }, (_, index) => `seed-${index}`)

describe('style definition', () => {
  test('satisfies the DiceBear schema', () => {
    expect(() => validateDefinition(styleDefinition)).not.toThrow()
  })

  test('declares the load-bearing component names that form the public API', () => {
    // Renaming one of these silently breaks every consumer's `<name>Variant` option. Asserted as a
    // required subset rather than an exact list: the style still gains and loses minor components as it
    // is refined, and a frozen snapshot would fail on every such change without catching a real break.
    const components = Object.keys(styleDefinition.components)

    for (const component of ['clothes', 'top']) {
      expect(components).toContain(component)
    }
  })

  test('exposes a colour group per recolourable part', () => {
    // These become `clothesColor`, `accentColor` and so on. Consumers recolour outfits through them, so
    // a garment sharing another's group would make it impossible to colour the two independently.
    const colors = Object.keys(styleDefinition.colors)
    for (const group of ['skin', 'hair', 'clothes', 'shirt', 'accent', 'robe']) {
      expect(colors).toContain(group)
    }
  })

  test('carries the legal wardrobe that justifies the fork', () => {
    // Upstream has none of these; they are the artwork this project adds.
    const clothes = Object.keys(styleDefinition.components.clothes.variants)
    for (const garment of ['suit', 'gown']) {
      expect(clothes).toContain(garment)
    }
  })
})

describe('createAvatar', () => {
  test('is deterministic', () => {
    for (const seed of SEEDS) {
      const first = createAvatar({ seed, idRandomization: false }).toString()
      const second = createAvatar({ seed, idRandomization: false }).toString()
      expect(second).toBe(first)
    }
  })

  test('randomizes ids by default, so two avatars on one page cannot clash', () => {
    const first = createAvatar({ seed: 'same' }).toString()
    const second = createAvatar({ seed: 'same' }).toString()

    expect(second).not.toBe(first)
    // Only the identifiers differ; strip them and the artwork is identical.
    const strip = (svg: string) => svg.replace(/-[0-9a-f]{6,}/g, '-x')
    expect(strip(second)).toBe(strip(first))
  })

  test('varies the figure across seeds', () => {
    const drawn = new Set(
      SEEDS.map((seed) => createAvatar({ seed, idRandomization: false }).toString().match(/id="top-(\w+)-/)?.[1]),
    )

    expect(drawn.size).toBeGreaterThan(1)
  })

  test('recolours outfits independently, which is the point of the separate groups', () => {
    const svg = createAvatar({
      seed: 'recolour',
      idRandomization: false,
      clothesVariant: 'suit',
      clothesColor: '#1F2A33',
      shirtColor: '#FAF7F0',
      accentColor: '#7C2529',
    }).toString()

    for (const colour of ['#1f2a33', '#faf7f0', '#7c2529']) {
      expect(svg.toLowerCase()).toContain(colour)
    }
  })

  test('honours a pinned variant, which is how consumers build presets', () => {
    const svg = createAvatar({ seed: 'anything', idRandomization: false, clothesVariant: 'gown' }).toString()

    expect(svg).toContain('id="clothes-gown-')
  })
})
