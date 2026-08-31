// d19_http_routing / ex3 - reference solution (author only, used by `dojo verify`).

function segmentsOf(pattern: string): string[] {
  return pattern.split("/").filter((segment) => segment !== "");
}

/**
 * How specific this pattern is at one position. Running out of segments scores
 * between a param and a wildcard, which is what makes `/orders` beat
 * `/orders/*rest` while still losing to `/orders/:id`.
 */
function rankAt(parts: string[], index: number): number {
  if (index >= parts.length) return 1;
  const part = parts[index];
  if (part.startsWith("*")) return 0;
  if (part.startsWith(":")) return 2;
  return 3;
}

export function rankPatterns(patterns: string[]): string[] {
  const entries = patterns.map((pattern, index) => ({
    pattern,
    index,
    parts: segmentsOf(pattern),
  }));

  // A copy, because sort() reorders in place and the caller handed us its
  // routing table, not a spare one.
  return entries
    .sort((a, b) => {
      const length = Math.max(a.parts.length, b.parts.length);
      for (let i = 0; i < length; i += 1) {
        const difference = rankAt(b.parts, i) - rankAt(a.parts, i);
        if (difference !== 0) return difference;
      }
      // Equally specific: registration order, stated rather than inherited
      // from whatever sort() happens to do.
      return a.index - b.index;
    })
    .map((entry) => entry.pattern);
}
