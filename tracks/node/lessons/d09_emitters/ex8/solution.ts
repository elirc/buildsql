// d09_emitters / ex8 - waiting for an event, with a way out.
// See lessons/d09_emitters/README.md, "Problem 8".
import type { EventEmitter } from "node:events";

/**
 * Resolve with the first argument of the next `name` event, or reject with
 * `signal.reason` if the caller gives up first.
 *
 * An already-aborted signal rejects without attaching anything at all, and
 * every path removes both listeners it added.
 */
export function onceWithSignal<T>(
  emitter: EventEmitter,
  name: string,
  signal: AbortSignal,
): Promise<T> {
  throw new Error("ex8: onceWithSignal() is not implemented yet - edit this file.");
}
