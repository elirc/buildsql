// d15_readable_writable / ex5 - reference solution (author only, used by `dojo verify`).
import { Readable } from "node:stream";

export function concatStreams(sources: Readable[]): Readable {
  // The generator IS the laziness: the for-await over source 2 does not exist
  // until the loop over source 1 has finished, so nothing subscribes to it,
  // resumes it, or holds it open early.
  async function* all(): AsyncGenerator<unknown> {
    for (const source of sources) {
      yield* source;
    }
  }
  // A source that errors rejects the pending next(), the generator throws, and
  // Readable.from destroys the joined stream with that error.
  return Readable.from(all());
}
