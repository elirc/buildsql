// 08_utility_types / ex1 - reference solution (author only).

export function applyPatch<T extends object>(base: T, patch: Partial<T>): T {
  const merged = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) {
      (merged as Record<string, unknown>)[key] = value;
    }
  }
  return merged;
}
