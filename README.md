# lexavataaars

Deterministic avatars for legal software — judges, prosecutors, notaries and advocates, in business
formal and court dress.

Generic avatar libraries give you playful robots, hoodies and grinning cartoons. In a product where
people read case law and draft contracts, that reads as a mistake. `lexavataaars` gives you the same
identity guarantee — one seed, one avatar, forever — dressed for the profession: suits, waistcoats,
gowns, bands, jabot, the barrister's wig.

Faces are deliberately composed. There is no expression pool to draw from, because an avatar beside a
case-law citation should not be feeling anything.

```sh
bun add lexavataaars     # or: npm i lexavataaars
```

```ts
import { createAvatar } from 'lexavataaars'

createAvatar({ seed: agent.id }).toDataUri()   // data:image/svg+xml,… for <img src>
createAvatar({ seed: agent.id }).toString()    // raw SVG markup
```

That is the whole API for the common case. Everything below is optional.

> **Status: 0.x.** The API is settled; the artwork is still being refined. Expect visual changes before
> 1.0, not breaking option changes.

---

## Dressing the figure

Fourteen garments, weighted so business formal is the common case and court dress the occasional one.

| | |
| --- | --- |
| **Business** | `shirtAndTie` `shirtAndBowTie` `suit` `suitAndWaistcoat` `suitAndBowTie` `suitAndCravat` `waistcoatAndTie` `waistcoatAndBowTie` `doubleBreastedSuit` `blazer` |
| **Court & academic** | `gown` `gownAndBands` `gownAndJabot` `gownAndHood` |

Twenty-two `top` variants cover hair plus the two pieces of court headwear, `wig` and `biretta`.

Pin any component with `<name>Variant` — a single value, an array to choose from, or an object mapping
variants to weights:

```ts
createAvatar({ seed, clothesVariant: 'gownAndBands' })              // always this
createAvatar({ seed, clothesVariant: ['suit', 'doubleBreastedSuit'] })   // one of these
createAvatar({ seed, clothesVariant: { suit: 5, gown: 1 } })        // weighted
```

Components: `clothes` `top` `mouth` `eyebrows` `nose` `accessories` `facialHair`.

Two of them are deliberately rare, the way accessories are in every well-behaved avatar set — spectacles
appear on 24% of figures and facial hair on 14%. **Pinning a variant does not override that**: it chooses
*which* beard, not *whether* there is one. Use `<name>Probability` for that:

```ts
createAvatar({ seed, facialHairVariant: 'beardMedium', facialHairProbability: 100 })
```

## Recolouring

Every part that a consumer would sensibly want to recolour has its own colour group, so nothing is
welded to anything else — the tie recolours without touching the shirt, the gown's silk facings without
touching its body.

| Option | Paints |
| --- | --- |
| `clothesColor` | jacket, coat, blazer body |
| `shirtColor` | shirt and collar |
| `accentColor` | tie, bow tie, cravat — the one saturated note |
| `robeColor` | gown and robe body |
| `facingColor` | the gown's silk facings |
| `hairColor` · `wigColor` | hair; the barrister's wig separately |
| `skinColor` · `facialHairColor` | |
| `accessoriesColor` · `hatColor` | spectacles; the biretta |

Each takes a hex string, or an array to choose from. Each also has a `<name>ColorFill` accepting
`solid`, `linear` or `radial` for gradients, and `<name>ColorFillStops` for the stop count.

A colour option only takes effect when the part it paints is actually drawn — `robeColor` does nothing
on a figure wearing a suit, and it will not appear in `avatar.toJSON().options` for that render either.
That is not an error; set it anyway and it applies whenever a gown comes up.

```ts
const HOUSE_STYLE = {
  clothesVariant: ['suit', 'suitAndWaistcoat', 'doubleBreastedSuit'],
  clothesColor: '#2C3A44',
  shirtColor: '#FAF7F0',
  accentColor: ['#7C2529', '#1F4C63'],
}

createAvatar({ seed: agent.id, ...HOUSE_STYLE })
```

There is no notion of a role or a category in this library, deliberately. Narrowing the output for a
kind of user is a preset in your own code, as above — not a concept the library imposes.

## Backgrounds and small sizes

The avatar is **transparent by default**, so it sits on whatever surface you put it on.

That works against you when it gets small. At 16px — a picker row, a compact list — a transparent
head-and-shoulders portrait on a pale surface loses its outline. Give it a ground and it comes back:

```ts
createAvatar({ seed, backgroundColor: '#E4DCCC' })                    // solid
createAvatar({ seed, backgroundColor: ['#2C3A44', '#1B1A18'],
                     backgroundColorFill: 'radial' })                 // gradient
```

Other useful options: `size`, `borderRadius` (0–50), `flip`, `scale`, `rotate`, `translateX` /
`translateY`, and `<name>Rotate` / `<name>Scale` per component.

`idRandomization` defaults to **on**. Leave it that way when more than one avatar shares a page —
without it they share internal SVG ids and the second silently repaints the first. Turn it off only
when you need byte-identical output, such as in a snapshot test.

## Works with the DiceBear ecosystem

The style is a plain [DiceBear](https://www.dicebear.com) definition, not a bespoke format. The whole
ecosystem therefore works against it unchanged, and this repository does not have to maintain any of it:

```sh
npx @dicebear/cli node_modules/lexavataaars/dist/lexavataaars.json ./out --count 20 --format png
```

The definition is exported for that purpose:

```ts
import definition from 'lexavataaars/definition.json' with { type: 'json' }
```

Verified against `@dicebear/cli@10.3.1` — SVG and PNG both render, and the licence banner prints
correctly. The same JSON is what the PHP, Python, Rust, Go and Dart ports consume.

---

## Working on it

```sh
bun install
bun run forge                          # regenerate the definition from the recipe
bun test                               # schema, determinism, compatibility, licensing
bun run typecheck
bun run --cwd apps/playground dev      # visual review at every size the avatar appears at
```

```
recipes/lexavataaars.recipe.ts   design intent — the file you tune to change the look
recipes/lexavataaars/            the derivation: what was lifted, cut, and drawn
packages/forge/                  build pipeline: fetch → normalize → compose → emit  (not published)
packages/core/                   the published wrapper, plus the generated definition
apps/playground/                 review surface
```

The generated definition is committed, so a build never needs the network.

## Provenance and licence

MIT, including the artwork.

The figures derive from [Avataaars](https://github.com/fangpenlin/avataaars) — MIT, with Pablo Stanley
named as a copyright holder alongside Fang-Pen Lin, so the grant to make and redistribute derivatives
comes from the artwork's own author. The path data reaches this project through
[DiceBear](https://www.dicebear.com)'s MIT remix of it.

Both upstream notices travel in [LICENSE](./LICENSE), as MIT requires.
`recipes/lexavataaars/LICENCE.md` records the chain piece by piece.

What this project adds, and the reason it exists as a fork rather than a filter: the legal wardrobe,
the court headwear, rebuilt neutral faces, and the separated colour groups that make the outfits
recolourable. Upstream has no legal dress at all.
