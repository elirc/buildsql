// d01_esm_cjs / ex7 - the CommonJS lookup algorithm, by hand.
// See lessons/d01_esm_cjs/README.md, "Problem 7".

/**
 * Resolve a relative specifier the way `require()` does, inside one directory.
 *
 * Tried in order: the path exactly as written, then + ".js", ".json", ".cjs",
 * then "index.js" and "index.json" inside it if it is a directory.
 * Returns the absolute path, or null when nothing matches.
 */
export async function resolveSpecifier(
  dir: string,
  specifier: string,
): Promise<string | null> {
  throw new Error("ex7: resolveSpecifier() is not implemented yet - edit this file.");
}
