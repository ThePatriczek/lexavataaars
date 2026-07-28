export type {
  ColorGroup,
  ColorReference,
  Component,
  ComponentAlias,
  Definition,
  Element,
  Range,
  Variant,
} from './definition.ts'
export { compose, ComposeError, iconRefsOf } from './compose/index.ts'
export type {
  CanvasHelpers,
  ComponentSpec,
  IconComponentSpec,
  InlineComponentSpec,
  Recipe,
} from './compose/recipe.ts'
export {
  validateDefinition,
  ValidationError,
  writeAttribution,
  writeDefinition,
  writeNotice,
} from './emit/index.ts'
export { NormalizeError, normalizeIconBody } from './normalize/index.ts'
export type { NormalizeOptions } from './normalize/index.ts'
export {
  annulus,
  guilloche,
  laidLines,
  rosette,
  sealEdge,
  tickRing,
} from './generate/geometry.ts'
export type {
  GuillocheOptions,
  LaidLinesOptions,
  RosetteOptions,
  SealOptions,
  TickRingOptions,
} from './generate/geometry.ts'
export { AssetError, FILE_PREFIX, isFileRef, loadFileIcons } from './sources/files.ts'
export { fetchCollections, fetchIcons } from './sources/iconify.ts'
export type { CollectionMeta, FetchedIcon, IconRef } from './sources/iconify.ts'
export { ALLOWED_SPDX, collectAttributions, LicenseError } from './sources/licenses.ts'
export type { Attribution } from './sources/licenses.ts'
