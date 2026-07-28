/**
 * `bun run --cwd apps/playground dev` — serves the review page with hot reload.
 *
 * Run `bun run forge` after editing a recipe; the next request picks up the regenerated definition.
 */

import { renderPage } from './page.ts'

const server = Bun.serve({
  port: Number(Bun.env.PORT ?? 5173),
  fetch() {
    return new Response(renderPage(), {
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
    })
  },
})

console.log(`playground → ${server.url}`)
