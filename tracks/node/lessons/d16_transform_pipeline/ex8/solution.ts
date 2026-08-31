// d16_transform_pipeline / ex8 - one stream in, many files out.
// See lessons/d16_transform_pipeline/README.md, "Problem 8".
import type { Readable, Writable } from "node:stream";

/**
 * Route every item of `source` to the sink its key names, opening each sink at
 * most once through `openSink`. Ends every sink when the source runs out and
 * resolves with the per-key counts; on any failure destroys them all and
 * rejects.
 */
export async function partitionTo<T>(
  source: Readable,
  keyOf: (item: T) => string,
  openSink: (key: string) => Writable,
): Promise<Record<string, number>> {
  throw new Error("ex8: partitionTo() is not implemented yet - edit this file.");
}
