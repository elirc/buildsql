// d09_emitters / ex4 - an emitter that remembers what it missed.
// See lessons/d09_emitters/README.md, "Problem 4".

export type Listener = (...args: unknown[]) => void;

export interface StickyEmitter {
  /** Delivered if anybody is listening (returns true), buffered if not (false). */
  emit(event: string, ...args: unknown[]): boolean;
  /** The FIRST listener for an event immediately receives the whole backlog. */
  on(event: string, listener: Listener): void;
  off(event: string, listener: Listener): void;
  buffered(event: string): number;
}

export function createStickyEmitter(): StickyEmitter {
  throw new Error("ex4: createStickyEmitter() is not implemented yet - edit this file.");
}
