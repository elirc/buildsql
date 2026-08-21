// 04_events_errors / challenge - EventEmitter, from scratch.
// See lessons/04_events_errors/README.md, "Challenge".

export type Listener = (...args: any[]) => void;

export interface Emitter {
  on(event: string, listener: Listener): void;
  once(event: string, listener: Listener): void;
  off(event: string, listener: Listener): void;
  /** Returns true if at least one listener was called. */
  emit(event: string, ...args: unknown[]): boolean;
}

export function createEmitter(): Emitter {
  throw new Error("challenge: createEmitter() is not implemented yet - edit this file.");
}
