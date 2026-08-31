// d09_emitters / ex6 - the error event is not an ordinary event.
// See lessons/d09_emitters/README.md, "Problem 6".

export type Listener = (...args: unknown[]) => void;

export interface StrictEmitter {
  on(event: string, listener: Listener): void;
  once(event: string, listener: Listener): void;
  off(event: string, listener: Listener): void;
  /**
   * true if at least one listener was called. Emitting "error" with no
   * listener THROWS instead - the error itself if one was passed.
   */
  emit(event: string, ...args: unknown[]): boolean;
  listenerCount(event: string): number;
}

export function createStrictEmitter(): StrictEmitter {
  throw new Error("ex6: createStrictEmitter() is not implemented yet - edit this file.");
}
