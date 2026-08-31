// d05_unions_basics / ex6 - reference solution (author only).

export function compact(values: readonly (string | null | undefined)[]): string[] {
  const kept: string[] = [];
  for (const value of values) {
    if (value !== null && value !== undefined) {
      kept.push(value);
    }
  }
  return kept;
}
