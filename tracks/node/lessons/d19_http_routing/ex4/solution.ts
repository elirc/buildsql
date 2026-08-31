// d19_http_routing / ex4 - the router, run backwards.
// See lessons/d19_http_routing/README.md, "Problem 4".

/**
 * Fill `pattern` from `params` and append a query string sorted by key.
 * Optional segments with no value are left off; a missing required parameter
 * throws an error naming it.
 */
export function buildLink(
  pattern: string,
  params: Record<string, string> = {},
  query: Record<string, string | string[]> = {},
): string {
  throw new Error("ex4: buildLink() is not implemented yet - edit this file.");
}
