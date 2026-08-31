// d09_emitters / ex2 - waiting for whichever happens first.
// See lessons/d09_emitters/README.md, "Problem 2".
import type { EventEmitter } from "node:events";

export interface FirstEvent {
  event: string;
  args: unknown[];
}

/**
 * Resolve with whichever of `names` fires first, and its arguments. An "error"
 * event rejects with that error. Every listener added must be removed once the
 * promise settles, whichever way it went.
 */
export function firstOf(
  emitter: EventEmitter,
  names: readonly string[],
): Promise<FirstEvent> {
  throw new Error("ex2: firstOf() is not implemented yet - edit this file.");
}
