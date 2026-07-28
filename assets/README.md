# assets

Hand-drawn artwork, referenced from a recipe as `file:<name>.svg`.

Everything here goes through the same normalization as a fetched icon — colours become palette
references, strokes are unified — so custom artwork cannot drift away from the rest of the style.

Rules:

- One `<svg>` root with an explicit `viewBox`. Dimensions are read from the viewBox, never from
  `width`/`height`.
- Draw on the same 100×100 grid as the canvas, so parts align without per-part placement maths.
- Silhouettes are **filled**, not stroked. A filled mass survives being scaled to 16px; a 1px outline
  does not.
- Keep each file to a single silhouette. Layering is the recipe's job.

What belongs here is artwork that sits at a *fixed* place on the figure — the throat and the shoulder,
which every bust shares. Anything that has to fit the head does not: headwear used to live here and was
the reason the cranium had to be frozen, because a wig drawn against one skull cannot fit another. It is
generated from the skull's own landmarks now (`packages/forge/src/generate/headwear.ts`).
