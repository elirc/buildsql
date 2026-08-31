// d19_http_routing / ex1 - a request line, taken apart.
// See lessons/d19_http_routing/README.md, "Problem 1".

export interface RouteParts {
  /** Decoded path segments, with empty ones dropped. */
  segments: string[];
  /** Decoded query, where a repeated key becomes an array. */
  query: Record<string, string | string[]>;
}

/** Split a raw `req.url` into the two things a router needs. */
export function splitRoute(url: string): RouteParts {
  throw new Error("ex1: splitRoute() is not implemented yet - edit this file.");
}
