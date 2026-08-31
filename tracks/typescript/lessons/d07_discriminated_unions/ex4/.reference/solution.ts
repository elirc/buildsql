// d07_discriminated_unions / ex4 - reference solution (author only).

export type Frame =
  | { version: 1; payload: string }
  | { version: 2; payload: readonly string[]; codec: "gzip" | "raw" };

export function readFrame(frame: Frame): string {
  if (frame.version === 1) {
    return frame.payload;
  }
  const joined = frame.payload.join("|");
  return frame.codec === "gzip" ? `gzip(${joined})` : joined;
}
