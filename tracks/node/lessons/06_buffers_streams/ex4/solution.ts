// 06_buffers_streams / ex4 - a sink of your own.
// See lessons/06_buffers_streams/README.md, "Exercise 4".
import { Writable } from "node:stream";

export interface Collector {
  writable: Writable;
  /** Everything written so far, decoded as UTF-8. */
  text(): string;
}

export function createCollector(): Collector {
  throw new Error("ex4: createCollector() is not implemented yet - edit this file.");
}
