// d19_http_routing / ex2 - reference solution (author only, used by `dojo verify`).

export type RouteParams = Record<string, string>;

function segmentsOf(path: string): string[] {
  return path.split("/").filter((segment) => segment !== "");
}

export function matchPattern(pattern: string, pathname: string): RouteParams | null {
  const patternParts = segmentsOf(pattern);
  // Decoded once, up front, so literals, params and the wildcard all compare
  // and report the same way.
  const pathParts = segmentsOf(pathname).map(decodeURIComponent);
  const params: RouteParams = {};

  for (let i = 0; i < patternParts.length; i += 1) {
    const part = patternParts[i];

    if (part.startsWith("*")) {
      // The wildcard is always last and always matches, even against nothing.
      params[part.slice(1)] = pathParts.slice(i).join("/");
      return params;
    }

    if (i >= pathParts.length) {
      // The path ran out. That is only a match if everything left is optional.
      const remaining = patternParts.slice(i);
      const allOptional = remaining.every((rest) => rest.startsWith(":") && rest.endsWith("?"));
      return allOptional ? params : null;
    }

    if (part.startsWith(":")) {
      const optional = part.endsWith("?");
      params[part.slice(1, optional ? -1 : undefined)] = pathParts[i];
      continue;
    }

    if (part !== pathParts[i]) return null;
  }

  // The pattern ran out: a path with anything left over is a different route.
  return pathParts.length === patternParts.length ? params : null;
}
