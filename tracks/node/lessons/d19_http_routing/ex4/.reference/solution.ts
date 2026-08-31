// d19_http_routing / ex4 - reference solution (author only, used by `dojo verify`).

export function buildLink(
  pattern: string,
  params: Record<string, string> = {},
  query: Record<string, string | string[]> = {},
): string {
  const parts: string[] = [];

  for (const segment of pattern.split("/").filter((part) => part !== "")) {
    if (segment.startsWith("*")) {
      const name = segment.slice(1);
      const value = params[name];
      if (value === undefined) {
        throw new Error(`buildLink: missing parameter ${name} for ${pattern}`);
      }
      // The separators inside a wildcard are structure and survive; the
      // segments between them are content and are encoded.
      parts.push(
        ...value
          .split("/")
          .filter((part) => part !== "")
          .map(encodeURIComponent),
      );
      continue;
    }

    if (segment.startsWith(":")) {
      const optional = segment.endsWith("?");
      const name = segment.slice(1, optional ? -1 : undefined);
      const value = params[name];
      if (value === undefined) {
        if (optional) continue;
        throw new Error(`buildLink: missing parameter ${name} for ${pattern}`);
      }
      parts.push(encodeURIComponent(value));
      continue;
    }

    parts.push(segment);
  }

  const pairs: string[] = [];
  // Sorted, so the same inputs always produce the same string - which is what
  // makes the result usable as a cache key or a snapshot.
  for (const key of Object.keys(query).sort()) {
    const value = query[key];
    for (const item of Array.isArray(value) ? value : [value]) {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(item)}`);
    }
  }

  return `/${parts.join("/")}${pairs.length === 0 ? "" : `?${pairs.join("&")}`}`;
}
