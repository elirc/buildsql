// d17_backpressure / ex5 - pause high, resume low.
// See lessons/d17_backpressure/README.md, "Problem 5".
import type { Readable, Writable } from "node:stream";

export interface PumpReport {
  /** Chunks taken from the source. */
  written: number;
  /** The highest writableLength the sink ever reached. */
  maxBuffered: number;
  /** How many times the source was paused. */
  pauses: number;
}

/**
 * Move everything from `source` into `sink`, pausing the source when the sink
 * is holding more than `pauseAbove` and resuming it once it is back below
 * `resumeBelow`.
 */
export function pumpWithHysteresis(
  source: Readable,
  sink: Writable,
  options: { pauseAbove: number; resumeBelow: number },
): Promise<PumpReport> {
  throw new Error("ex5: pumpWithHysteresis() is not implemented yet - edit this file.");
}
