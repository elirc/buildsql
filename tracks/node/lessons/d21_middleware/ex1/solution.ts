// d21_middleware / ex1 - how long did that take, on a clock you control.
// See lessons/d21_middleware/README.md, "Problem 1".
import { type RequestHandler } from "express";

export interface TimingOptions {
  /** The clock. Injected so the gate can move time without waiting for it. */
  now: () => number;
}

/**
 * Middleware that sets `x-response-time` to the milliseconds elapsed between
 * the request arriving and the response being sent — which means the header has
 * to be set *before* the response goes out.
 */
export function timing(options: TimingOptions): RequestHandler {
  throw new Error("ex1: timing() is not implemented yet - edit this file.");
}
