// d07_discriminated_unions / ex4 - a numeric discriminant.
// See lessons/d07_discriminated_unions/README.md, "ex4".
//
// A tag can be a number literal. `number` is not one.

export type Frame =
  | { version: number; payload: string }
  | { version: number; payload: readonly string[]; codec: "gzip" | "raw" };

export function readFrame(frame: Frame): string {
  throw new Error("ex4: readFrame() is not implemented yet - edit this file.");
}
