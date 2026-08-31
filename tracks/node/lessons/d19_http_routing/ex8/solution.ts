// d19_http_routing / ex8 - routing as a tree, the way a filesystem does it.
// See lessons/d19_http_routing/README.md, "Problem 8".

export interface RouteNode {
  /** Children matched by exact segment name. */
  children?: Record<string, RouteNode>;
  /** The child that matches any one segment, and the name it binds. */
  param?: { name: string; node: RouteNode };
  /** Methods answered when the path ends at this node. */
  index?: string[];
}

export interface RouteMatch {
  /** Node names from the root down: a segment, or `:name` for a param. */
  chain: string[];
  /** Every param bound on the way, merged. */
  params: Record<string, string>;
}

/** Walk `tree` for `pathname`, or `null` if nothing there answers `method`. */
export function resolveRouteTree(
  tree: RouteNode,
  method: string,
  pathname: string,
): RouteMatch | null {
  throw new Error("ex8: resolveRouteTree() is not implemented yet - edit this file.");
}
