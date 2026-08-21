// i2_interview_drills / review1 - an event bus with wildcards.
// See lessons/i2_interview_drills/README.md, "Review".

export type BusListener = (...args: any[]) => void;

export interface Bus {
  on(event: string, listener: BusListener): void;
  once(event: string, listener: BusListener): void;
  off(event: string, listener: BusListener): void;
  /** Returns how many listeners were called. */
  emit(event: string, ...args: unknown[]): number;
}

export function createBus(): Bus {
  throw new Error("review1: createBus() is not implemented yet - edit this file.");
}
