// 04_unions_narrowing / challenge - reference solution (author only).

export type Result = { ok: true; value: string } | { ok: false; error: string };

export interface Partitioned {
  values: string[];
  errors: string[];
}

export function unwrapOr(result: Result, fallback: string): string {
  return result.ok ? result.value : fallback;
}

export function partition(results: readonly Result[]): Partitioned {
  const partitioned: Partitioned = { values: [], errors: [] };
  for (const result of results) {
    if (result.ok) {
      partitioned.values.push(result.value);
    } else {
      partitioned.errors.push(result.error);
    }
  }
  return partitioned;
}
