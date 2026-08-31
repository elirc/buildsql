// d21_middleware / ex7 - how many requests are allowed to be inside at once.
// See lessons/d21_middleware/README.md, "Problem 7".
import { type RequestHandler } from "express";

export interface ConcurrencyOptions {
  /** How many requests may be past this middleware at the same time. */
  max: number;
  /** How many more may wait for a slot before the rest are refused. */
  queue: number;
}

/**
 * Admits at most `max` requests at a time, parks up to `queue` more, and
 * answers `503 { error: "too_busy" }` with `Retry-After` to everything beyond
 * that. A slot is given back however the request ended.
 */
export function concurrencyLimit(options: ConcurrencyOptions): RequestHandler {
  throw new Error("ex7: concurrencyLimit() is not implemented yet - edit this file.");
}
