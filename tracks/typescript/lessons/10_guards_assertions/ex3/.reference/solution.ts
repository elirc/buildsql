// 10_guards_assertions / ex3 - reference solution (author only).

export function parseJson(text: string): unknown {
  return JSON.parse(text);
}

export function readTitle(value: unknown): string | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const title = (value as Record<string, unknown>).title;
  return typeof title === "string" ? title : null;
}
