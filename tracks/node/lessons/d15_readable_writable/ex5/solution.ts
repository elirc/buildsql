// d15_readable_writable / ex5 - one stream after another, not all at once.
// See lessons/d15_readable_writable/README.md, "Problem 5".
import { Readable } from "node:stream";

/**
 * One Readable that yields everything from the first source, then the second,
 * and so on. Each source is only started once the one before it has ended, and
 * an error in any source destroys the joined stream with that error.
 */
export function concatStreams(sources: Readable[]): Readable {
  throw new Error("ex5: concatStreams() is not implemented yet - edit this file.");
}
