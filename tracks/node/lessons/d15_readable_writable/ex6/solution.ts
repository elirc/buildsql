// d15_readable_writable / ex6 - a paginated API wearing a stream.
// See lessons/d15_readable_writable/README.md, "Problem 6".
import { Readable } from "node:stream";

export interface Page<T> {
  items: T[];
  /** The cursor for the next page, or null when this was the last one. */
  next: string | null;
}

/**
 * An object-mode Readable over `fetchPage`, called first with `null` and then
 * with each `next` cursor, one call at a time, until `next` is null. A rejected
 * fetch destroys the stream with that error.
 */
export function createPagedSource<T>(
  fetchPage: (cursor: string | null) => Promise<Page<T>>,
): Readable {
  throw new Error("ex6: createPagedSource() is not implemented yet - edit this file.");
}
