/**
 * DiceBear compatibility.
 *
 * The whole architectural bet of this project is that the style is a plain DiceBear definition rather
 * than something only our own wrapper can render. That buys the DiceBear CLI, the PNG converter and the
 * PHP, Python, Rust, Go and Dart ports for free — but only for as long as the definition stays
 * self-contained and standards-compliant, which is easy to break by accident and invisible when you do.
 *
 * Verified by hand against `@dicebear/cli@10.3.1`, which rendered this definition to SVG and to 256×256
 * PNG and printed its licence banner correctly. These tests hold the invariants that made that work.
 */

import { describe, expect, test } from 'bun:test'
import { Avatar, Style } from '@dicebear/core'
import definition from '../packages/core/src/styles/lexavataaars.json' with { type: 'json' }

describe('the definition stands on its own', () => {
  test('renders through bare @dicebear/core, with no help from our wrapper', () => {
    // If this ever needs something from `packages/core`, the CLI and every language port lose the style.
    const svg = new Avatar(new Style(definition), { seed: 'compat' }).toString()

    expect(svg).toStartWith('<svg')
    expect(svg).toContain('</svg>')
  })

  test('carries the metadata the CLI and the ports print', () => {
    // The CLI banner is built from these; an empty licence there is how a project quietly loses its
    // provenance.
    expect(definition.meta.license.name).toBeTruthy()
    expect(definition.meta.license.url).toBeTruthy()
    expect(definition.meta.creator.name).toBeTruthy()
    expect(definition.meta.source.url).toBeTruthy()
  })

  test('credits the MIT source the artwork actually comes from', () => {
    expect(definition.meta.license.name).toBe('MIT')
    expect(definition.meta.source.url).toContain('fangpenlin/avataaars')
  })

  test('uses no namespaced attributes, which the schema forbids', () => {
    // Upstream's artwork is built from masks and `xlink:href`, neither of which the definition format
    // permits. It was flattened to plain paths for that reason; this catches a regression that would
    // validate locally and then fail in a stricter port.
    const raw = JSON.stringify(definition)

    expect(raw).not.toContain('xlink')
    expect(raw).not.toContain('xmlns:')
  })
})
