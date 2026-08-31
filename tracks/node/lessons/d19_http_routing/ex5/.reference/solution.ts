// d19_http_routing / ex5 - reference solution (author only, used by `dojo verify`).

export interface Canonical {
  path: string;
  changed: boolean;
}

export function canonicalPath(url: string): Canonical {
  // The path only. The query is the caller's to carry.
  const raw = url.split("?")[0].split("#")[0];

  const parts: string[] = [];
  // Deliberately NOT decoded: %2f is a character in a segment, not a
  // separator, and decoding here puts back the traversal you are removing.
  for (const segment of raw.split("/")) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") {
      // pop() on an empty array is a no-op, which is exactly the rule: there
      // is nothing above the root to climb to.
      parts.pop();
      continue;
    }
    parts.push(segment);
  }

  const path = parts.length === 0 ? "/" : `/${parts.join("/")}`;
  return { path, changed: path !== raw };
}
