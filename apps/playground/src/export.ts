/**
 * Writes the review page to a standalone HTML file, for sharing a design round without running a server.
 */

import { join } from 'node:path'
import { renderPage } from './page.ts'

const target = join(import.meta.dir, '../preview.html')
await Bun.write(target, renderPage())
console.log(`wrote ${target}`)
