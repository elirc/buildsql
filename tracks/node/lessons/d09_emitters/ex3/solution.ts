// d09_emitters / ex3 - piping events from one emitter to another.
// See lessons/d09_emitters/README.md, "Problem 3".
import type { EventEmitter } from "node:events";

export interface ForwardOptions {
  events: readonly string[];
  /** prepended to the event name on the target; defaults to nothing */
  prefix?: string;
}

/**
 * Re-emit the named events on `target`, arguments untouched. Returns an
 * unsubscribe that removes exactly what was added - and nothing else - and is
 * safe to call twice.
 */
export function forward(
  source: EventEmitter,
  target: EventEmitter,
  options: ForwardOptions,
): () => void {
  throw new Error("ex3: forward() is not implemented yet - edit this file.");
}
