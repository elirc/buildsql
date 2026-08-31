// d19_http_routing / ex3 - the order a router has to try things in.
// See lessons/d19_http_routing/README.md, "Problem 3".

/**
 * `patterns` sorted most specific first: a literal segment outranks a `:param`,
 * a `:param` outranks having no segment at all, and a `*wildcard` outranks
 * nothing. Equally specific patterns keep their original order, and the input
 * array is not modified.
 */
export function rankPatterns(patterns: string[]): string[] {
  throw new Error("ex3: rankPatterns() is not implemented yet - edit this file.");
}
