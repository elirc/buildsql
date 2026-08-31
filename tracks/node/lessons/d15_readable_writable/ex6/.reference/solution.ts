// d15_readable_writable / ex6 - reference solution (author only, used by `dojo verify`).
import { Readable } from "node:stream";

export interface Page<T> {
  items: T[];
  next: string | null;
}

export function createPagedSource<T>(
  fetchPage: (cursor: string | null) => Promise<Page<T>>,
): Readable {
  let cursor: string | null = null;
  let finished = false;
  let inFlight = false;

  return new Readable({
    objectMode: true,
    // A small buffer is what keeps this a stream: the default of 16 would
    // pull pages ahead of the consumer to fill it.
    highWaterMark: 1,
    read() {
      // read() can be called again before an async fetch lands - without this
      // guard the same cursor is fetched twice and pages arrive interleaved.
      if (finished || inFlight) return;
      inFlight = true;
      fetchPage(cursor).then(
        (page) => {
          inFlight = false;
          cursor = page.next;
          if (page.next === null) finished = true;
          for (const item of page.items) this.push(item);
          if (finished) this.push(null);
        },
        (error) => this.destroy(error as Error),
      );
    },
  });
}
