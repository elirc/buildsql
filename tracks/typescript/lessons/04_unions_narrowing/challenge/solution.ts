// 04_unions_narrowing / challenge - the Result type, by hand.
// See lessons/04_unions_narrowing/README.md, "Challenge".

export type Result = { ok: true; value: string };

export interface Partitioned {
  values: string[];
}

export function unwrapOr(result: Result, fallback: string): string {
  throw new Error("challenge: unwrapOr() is not implemented yet - edit this file.");
}

export function partition(results: readonly Result[]): Partitioned {
  throw new Error("challenge: partition() is not implemented yet - edit this file.");
}
