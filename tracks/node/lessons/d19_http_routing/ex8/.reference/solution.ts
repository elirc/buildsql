// d19_http_routing / ex8 - reference solution (author only, used by `dojo verify`).

export interface RouteNode {
  children?: Record<string, RouteNode>;
  param?: { name: string; node: RouteNode };
  index?: string[];
}

export interface RouteMatch {
  chain: string[];
  params: Record<string, string>;
}

export function resolveRouteTree(
  tree: RouteNode,
  method: string,
  pathname: string,
): RouteMatch | null {
  const segments = pathname
    .split("/")
    .filter((segment) => segment !== "")
    .map(decodeURIComponent);
  const wanted = method.toUpperCase();

  const walk = (node: RouteNode, depth: number): RouteMatch | null => {
    if (depth === segments.length) {
      // The path ends here, so this node has to be able to answer it. Matching
      // the path but not the method is not a match.
      return node.index?.includes(wanted) ? { chain: [], params: {} } : null;
    }

    const segment = segments[depth];

    // Static first: a literal child is more specific than a param child.
    const child = node.children?.[segment];
    if (child !== undefined) {
      const found = walk(child, depth + 1);
      // Note what does NOT happen here: a null does not return. The static
      // child matched this segment but failed further down, so the walk backs
      // out and tries the param child instead.
      if (found !== null) return { chain: [segment, ...found.chain], params: found.params };
    }

    if (node.param !== undefined) {
      const found = walk(node.param.node, depth + 1);
      if (found !== null) {
        return {
          chain: [`:${node.param.name}`, ...found.chain],
          // Spread the deeper params last, so a name bound twice resolves to
          // the innermost binding.
          params: { [node.param.name]: segment, ...found.params },
        };
      }
    }

    return null;
  };

  return walk(tree, 0);
}
