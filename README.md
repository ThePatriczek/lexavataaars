# lexavataaars

Elegant, deterministic avatars for legal and legal-tech products.

Generic avatar libraries give you playful robots and cartoon faces. In a product where people are
reading case law and drafting contracts, that reads as a mistake. `lexavataaars` produces restrained,
legally-literate marks from a seed — the same seed always yields the same avatar.

> **Status: early.** The pipeline works end to end and the API is settling, but the artwork is still
> being designed. Expect the visual output to change before 1.0.

## Install

```sh
bun add lexavataaars
```

## Use

```ts
import { createAvatar } from 'lexavataaars'

const avatar = createAvatar({ seed: agent.id })

avatar.toString()   // SVG markup
avatar.toDataUri()  // data:image/svg+xml,… for <img src>
```

## Options

The style is a plain [DiceBear](https://dicebear.com) definition, so it accepts DiceBear's render
options. The component and colour names below are part of the public API.

| Option | Values | Effect |
| --- | --- | --- |
| `seed` | string | The identity the avatar is derived from. |
| `size` | number | Output dimensions in pixels. |
| `motifVariant` | `scales` `gavel` `scroll` `column` `seal` — one, several, or weighted | Restricts which motifs may be selected. |
| `fieldColor` | hex or hex[] | Restricts the background palette. |
| `motifColor` | hex or hex[] | Restricts the motif palette. Chosen for maximum contrast against the field. |
| `borderRadius` | 0–50 | Corner rounding. |
| `flip` | `none` `horizontal` `vertical` `both` | Mirrors the avatar. |
| `idRandomization` | boolean, defaults to `true` | Keeps two avatars on one page from sharing internal SVG ids. |

### Presets are yours to define

There is no notion of a role or category in this library, deliberately. Narrowing the output for a
particular kind of user is a matter of pinning options in your own code:

```ts
const ADVISOR = { motifVariant: ['scales', 'column'], fieldColor: ['#F4EFE6'] }

createAvatar({ seed: agent.id, ...ADVISOR })
```

## How it is built

The style ships as a JSON definition validated against `@dicebear/schema`. Because that format is
DiceBear's own, the same file works with their CLI, their PNG converter, and their PHP, Python, Rust,
Go and Dart ports — none of which this repository has to maintain.

```
recipes/chambers.recipe.ts   design intent — the only file you tune to change the look
packages/forge/              build pipeline: fetch → normalize → compose → emit  (not published)
packages/core/               the published wrapper, plus the generated definition
apps/playground/             visual review at every size the avatar really appears at
```

```sh
bun install
bun run forge      # regenerate the definition from the recipe
bun test           # schema, determinism, normalization, licensing
bun run --cwd apps/playground dev      # review page on :5173
bun run --cwd apps/playground export   # same page as a standalone file
```

### Artwork sources

The avatar artwork derives from [Avataaars](https://github.com/fangpenlin/avataaars) by Pablo Stanley,
which is MIT-licensed with Pablo Stanley named as a copyright holder. The path data reaches this project
via [DiceBear](https://www.dicebear.com/)'s MIT-licensed remix of it; both notices are reproduced in
[LICENSE](./LICENSE), and `recipes/lexavataaars/LICENCE.md` records the full chain piece by piece.

Where a recipe pulls icons rather than shipping its own geometry, they come from permissively licensed
sets via the [Iconify](https://iconify.design) API, normalized onto a single grid and stroke weight. The
build fails if any set falls outside `MIT`, `ISC`, `Apache-2.0`, `CC0-1.0` or `Unlicense`, so this
project never inherits a per-use attribution obligation. See [ATTRIBUTION.md](./ATTRIBUTION.md) for what
is currently in use.

## License

MIT — both this project's own code and the artwork it derives from. See [LICENSE](./LICENSE) for the
upstream notices that must travel with any copy.
