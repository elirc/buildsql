// d09_emitters / ex7 - one delivery per window, not one per event.
// See lessons/d09_emitters/README.md, "Problem 7".

export interface CoalescingEmitter {
  /** The first push opens the window; later pushes join it without extending it. */
  push(value: string): void;
  on(listener: (batch: string[]) => void): void;
  /** Deliver now and cancel the pending window. An empty buffer delivers nothing. */
  flush(): void;
  pending(): number;
}

export function createCoalescingEmitter(options: {
  windowMs: number;
}): CoalescingEmitter {
  throw new Error(
    "ex7: createCoalescingEmitter() is not implemented yet - edit this file.",
  );
}
