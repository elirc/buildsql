// d09_emitters / ex5 - from events to an async iterable.
// See lessons/d09_emitters/README.md, "Problem 5".
import type { EventEmitter } from "node:events";

/**
 * Iterate the first argument of every `name` event, in order.
 *
 * "end" finishes the iteration; "error" throws that error into the loop, after
 * anything already queued has been delivered. Events emitted faster than the
 * consumer reads them are buffered, not dropped, and the listeners are removed
 * when the iteration finishes.
 */
export function iterateEvents<T>(emitter: EventEmitter, name: string): AsyncIterable<T> {
  throw new Error("ex5: iterateEvents() is not implemented yet - edit this file.");
}
