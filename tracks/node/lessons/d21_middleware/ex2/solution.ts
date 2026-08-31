// d21_middleware / ex2 - the same middleware, but not everywhere.
// See lessons/d21_middleware/README.md, "Problem 2".
import { type Request, type RequestHandler } from "express";

/**
 * Wrap `middleware` so it runs only when `predicate(req)` is true, and is
 * skipped — without stopping the request — when it is not. Whatever the wrapped
 * middleware passes to `next` reaches the caller unchanged.
 */
export function only(
  predicate: (req: Request) => boolean,
  middleware: RequestHandler,
): RequestHandler {
  throw new Error("ex2: only() is not implemented yet - edit this file.");
}
