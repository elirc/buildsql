// d16_transform_pipeline / ex6 - one source, several destinations.
// See lessons/d16_transform_pipeline/README.md, "Problem 6".
import type { Readable, Writable } from "node:stream";

/**
 * Send every item of `source` to every sink. Resolves when all of them have
 * finished; if any of them fails, rejects with that error and destroys the
 * source and all the other sinks.
 */
export async function tee(source: Readable, sinks: Writable[]): Promise<void> {
  throw new Error("ex6: tee() is not implemented yet - edit this file.");
}
