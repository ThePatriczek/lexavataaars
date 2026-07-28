import { describe, expect, test } from 'bun:test'
import { NormalizeError, normalizeIconBody } from '../packages/forge/src/normalize/index.ts'

const options = { colorName: 'motif', strokeWidth: 2 } as const

describe('normalizeIconBody', () => {
  test('turns markup into element nodes', () => {
    const [element] = normalizeIconBody('<path d="M0 0 L10 10"/>', options)

    expect(element).toEqual({
      type: 'element',
      name: 'path',
      attributes: { d: 'M0 0 L10 10' },
    })
  })

  test('keeps nested groups intact', () => {
    const [group] = normalizeIconBody('<g><circle cx="5" cy="5" r="2"/><path d="M1 1"/></g>', options)

    expect(group).toMatchObject({ name: 'g' })
    expect(group && 'children' in group ? group.children?.map((child) => 'name' in child && child.name) : []).toEqual([
      'circle',
      'path',
    ])
  })

  test('replaces the icon colour with a palette reference', () => {
    const [element] = normalizeIconBody('<path stroke="currentColor" d="M0 0"/>', options)

    expect(element).toMatchObject({ attributes: { stroke: { type: 'color', name: 'motif' } } })
  })

  test('replaces hard-coded colours too, so sets that ignore currentColor still recolour', () => {
    const [element] = normalizeIconBody('<path fill="#ff0000" d="M0 0"/>', options)

    expect(element).toMatchObject({ attributes: { fill: { type: 'color', name: 'motif' } } })
  })

  test('preserves fill="none", which distinguishes an outline from a filled shape', () => {
    const [element] = normalizeIconBody('<path fill="none" stroke="currentColor" d="M0 0"/>', options)

    expect(element).toMatchObject({ attributes: { fill: 'none' } })
  })

  test('unifies stroke treatment so mixed sources sit together', () => {
    const [element] = normalizeIconBody('<path stroke="currentColor" stroke-width="1.5" d="M0 0"/>', {
      colorName: 'motif',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    })

    expect(element).toMatchObject({
      attributes: { 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
    })
  })

  test('leaves unstroked shapes alone', () => {
    const [element] = normalizeIconBody('<circle cx="1" cy="1" r="1" fill="currentColor"/>', options)

    expect(element && 'attributes' in element ? element.attributes?.['stroke-width'] : undefined).toBeUndefined()
  })

  test('drops attributes the schema does not allow', () => {
    const [element] = normalizeIconBody('<path d="M0 0" data-name="x" xmlns="http://www.w3.org/2000/svg"/>', options)

    expect(element).toEqual({ type: 'element', name: 'path', attributes: { d: 'M0 0' } })
  })

  test('rejects disallowed elements rather than silently altering the artwork', () => {
    expect(() => normalizeIconBody('<script>alert(1)</script>', options)).toThrow(NormalizeError)
  })

  test('handles several top-level nodes', () => {
    const elements = normalizeIconBody('<path d="M0 0"/><path d="M1 1"/>', options)

    expect(elements).toHaveLength(2)
  })
})
