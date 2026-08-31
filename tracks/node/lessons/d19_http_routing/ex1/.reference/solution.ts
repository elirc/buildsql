// d19_http_routing / ex1 - reference solution (author only, used by `dojo verify`).

export interface RouteParts {
  segments: string[];
  query: Record<string, string | string[]>;
}

export function splitRoute(url: string): RouteParts {
  // A base is required because req.url is always relative; nothing about the
  // base survives into the answer.
  const parsed = new URL(url, "http://localhost");

  // Split FIRST, decode second. Decoding first would turn a %2f inside one
  // segment into a separator and split it into two.
  const segments = parsed.pathname
    .split("/")
    .filter((segment) => segment !== "")
    .map(decodeURIComponent);

  const query: Record<string, string | string[]> = {};
  // searchParams has already decoded both sides for us.
  for (const [key, value] of parsed.searchParams) {
    const existing = query[key];
    if (existing === undefined) query[key] = value;
    else if (Array.isArray(existing)) existing.push(value);
    else query[key] = [existing, value];
  }

  return { segments, query };
}
