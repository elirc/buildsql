// d24_mixed_gauntlet / ex7 - de-duplication, a breaker and a clock you inject.
// See lessons/d24_mixed_gauntlet/README.md, "Problem 7".

/** Thrown instead of calling the upstream while the circuit is open. */
export class CircuitOpenError extends Error {
  constructor(message = "circuit is open") {
    super(message);
    this.name = "CircuitOpenError";
  }
}

export interface ClientOptions<T> {
  call: (key: string) => Promise<T>;
  /** Consecutive failures that open the circuit. */
  failureThreshold: number;
  /** Milliseconds before the circuit will accept one probe. */
  cooldownMs: number;
  /** Injected so nothing here waits on a real clock. */
  now: () => number;
}

export interface ResilientClient<T> {
  get(key: string): Promise<T>;
  state(): "closed" | "open" | "half-open";
}

/**
 * Calls that share a key while one is in flight share its outcome; consecutive
 * failures open a circuit that fails fast until the cooldown has passed, and
 * then lets exactly one probe through.
 */
export function createResilientClient<T>(options: ClientOptions<T>): ResilientClient<T> {
  throw new Error("ex7: createResilientClient() is not implemented yet - edit this file.");
}
