// d02_functions_signatures / ex7 - reference solution (author only).

export function buildQuery(
  base: string,
  params?: Record<string, string | number | boolean>,
): string {
  const entries = Object.entries(params ?? {}).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  if (entries.length === 0) {
    return base;
  }
  const query = entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");
  return `${base}?${query}`;
}
