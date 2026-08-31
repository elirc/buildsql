// d07_discriminated_unions / ex3 - four statuses, three payloads.
// See lessons/d07_discriminated_unions/README.md, "ex3".

export type Load =
  | { status: string }
  | { status: string; startedAt: number }
  | { status: string; body: string }
  | { status: string; error: string; retriable: boolean };

export function renderLoad(load: Load): string {
  throw new Error("ex3: renderLoad() is not implemented yet - edit this file.");
}
