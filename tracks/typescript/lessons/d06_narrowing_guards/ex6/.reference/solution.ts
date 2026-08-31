// d06_narrowing_guards / ex6 - reference solution (author only).

export interface Tag {
  name: string;
  weight: number;
}

export function isTag(value: unknown): value is Tag {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate = value as { name?: unknown; weight?: unknown };
  return typeof candidate.name === "string" && typeof candidate.weight === "number";
}

export function collectTags(values: readonly unknown[]): Tag[] {
  return values.filter(isTag);
}
