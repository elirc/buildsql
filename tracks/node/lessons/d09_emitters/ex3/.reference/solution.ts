// d09_emitters / ex3 - reference solution (author only, used by `dojo verify`).
import type { EventEmitter } from "node:events";

export interface ForwardOptions {
  events: readonly string[];
  prefix?: string;
}

export function forward(
  source: EventEmitter,
  target: EventEmitter,
  options: ForwardOptions,
): () => void {
  const prefix = options.prefix ?? "";
  const added: Array<[string, (...args: unknown[]) => void]> = [];

  for (const event of options.events) {
    // Named once, kept, and used for both on() and off(): a fresh arrow
    // function at removal time is a different function and removes nothing.
    const listener = (...args: unknown[]): void => {
      target.emit(`${prefix}${event}`, ...args);
    };
    source.on(event, listener);
    added.push([event, listener]);
  }

  return () => {
    for (const [event, listener] of added) source.off(event, listener);
    // Emptying the list is what makes a second call a no-op.
    added.length = 0;
  };
}
