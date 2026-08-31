// d01_esm_cjs / ex8 - the modern replacement: an exports map.
// See lessons/d01_esm_cjs/README.md, "Problem 8".

/** The shape of a package.json "exports" field, simplified to one level. */
export type ExportsField = string | Record<string, string | null>;

/**
 * Resolve `subpath` ("." or "./something") against an exports field.
 * Returns the target string, or null when the package does not publish it.
 */
export function resolveExports(
  field: ExportsField,
  subpath: string,
): string | null {
  throw new Error("ex8: resolveExports() is not implemented yet - edit this file.");
}
