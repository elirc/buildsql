// d07_discriminated_unions / ex5 - narrowing inside a map callback.
// See lessons/d07_discriminated_unions/README.md, "ex5".

export type UiEvent =
  | { type: string; button: 0 | 1 | 2 }
  | { type: string; key: string; repeat: boolean }
  | { type: string; dy: number };

export function route(events: readonly UiEvent[]): string[] {
  throw new Error("ex5: route() is not implemented yet - edit this file.");
}
