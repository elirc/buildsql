// d23_realworld_apis / ex3 - reference solution (author only).

export function buildQuery(
  params: Record<string, string | number | boolean | undefined>,
): string {
  return Object.keys(params)
    .sort()
    .filter((key) => params[key] !== undefined)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(String(params[key])))
    .join("&");
}
