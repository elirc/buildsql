// d19_http_routing / ex5 - one URL per resource.
// See lessons/d19_http_routing/README.md, "Problem 5".

export interface Canonical {
  /** The canonical path. Never empty, never with a trailing slash except `/`. */
  path: string;
  /** Whether it differs from the path that came in. */
  changed: boolean;
}

/**
 * Collapse duplicate separators, resolve `.` and `..` without climbing above
 * the root, and drop a trailing slash. The query string is not part of the
 * answer and never counts as a change.
 */
export function canonicalPath(url: string): Canonical {
  throw new Error("ex5: canonicalPath() is not implemented yet - edit this file.");
}
