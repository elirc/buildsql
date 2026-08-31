// d19_unknown_any_never / ex1 - reference solution (author only).

export function parseJson(text: string): unknown {
  return JSON.parse(text) as unknown;
}
