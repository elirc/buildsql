// d19_http_routing / ex2 - does this pattern describe this path.
// See lessons/d19_http_routing/README.md, "Problem 2".

export type RouteParams = Record<string, string>;

/**
 * The parameters `pattern` binds when matched against `pathname`, or `null` if
 * it does not match. `:name` takes one segment, `:name?` may be absent, and a
 * trailing `*name` takes everything left, joined with slashes.
 */
export function matchPattern(pattern: string, pathname: string): RouteParams | null {
  throw new Error("ex2: matchPattern() is not implemented yet - edit this file.");
}
