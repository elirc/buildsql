// 04_events_errors / ex4 - a promise over an emitter, without the leak.
// See lessons/04_events_errors/README.md, "Exercise 4".
import type { EventEmitter } from "node:events";

export async function collectUntilEnd<T>(source: EventEmitter): Promise<T[]> {
  throw new Error("ex4: collectUntilEnd() is not implemented yet - edit this file.");
}
