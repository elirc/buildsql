// d04_timers_micro / ex2 - an interval you can actually stop.
// See lessons/d04_timers_micro/README.md, "Problem 2".

export interface TickerOptions {
  intervalMs: number;
  /** called with 1, 2, 3, ... */
  onTick: (n: number) => void;
}

export interface Ticker {
  /** No-op if already running. */
  start(): void;
  /** No-op if not running. Must leave no timer armed. */
  stop(): void;
  /** The running total, across stops and restarts. */
  ticks(): number;
  running(): boolean;
}

export function createTicker(options: TickerOptions): Ticker {
  throw new Error("ex2: createTicker() is not implemented yet - edit this file.");
}
