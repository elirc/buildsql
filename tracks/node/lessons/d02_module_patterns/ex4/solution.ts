// d02_module_patterns / ex4 - a namespace whose members build on first read.
// See lessons/d02_module_patterns/README.md, "Problem 4".

/**
 * Build an object with one enumerable property per factory. A factory runs the
 * first time its property is read, never before, and never twice. Unknown
 * properties are `undefined`.
 */
export function createNamespace(
  factories: Record<string, () => unknown>,
): Record<string, unknown> {
  throw new Error("ex4: createNamespace() is not implemented yet - edit this file.");
}
