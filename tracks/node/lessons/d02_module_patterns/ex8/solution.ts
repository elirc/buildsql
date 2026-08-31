// d02_module_patterns / ex8 - ordering a plugin graph.
// See lessons/d02_module_patterns/README.md, "Problem 8".

export interface Orderable {
  name: string;
  /** names that must come before this one */
  after?: string[];
}

/**
 * Return every name exactly once, each after everything it lists. When several
 * are ready at the same time, the alphabetically first goes next.
 *
 * Throws `unknown dependency: <name> needs <missing>` and
 * `circular dependency among: a, b` (sorted, only the stuck ones).
 */
export function orderPlugins(plugins: Orderable[]): string[] {
  throw new Error("ex8: orderPlugins() is not implemented yet - edit this file.");
}
