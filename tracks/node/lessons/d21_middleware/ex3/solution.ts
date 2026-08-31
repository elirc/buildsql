// d21_middleware / ex3 - a stack of middleware, wearing one middleware's coat.
// See lessons/d21_middleware/README.md, "Problem 3".
import { type RequestHandler } from "express";

/**
 * Fold `middlewares` into a single middleware: they run in order, one that
 * responds stops the rest, a `next(error)` skips straight to the error path,
 * and composing none of them is a middleware that only calls `next()`.
 */
export function compose(...middlewares: RequestHandler[]): RequestHandler {
  throw new Error("ex3: compose() is not implemented yet - edit this file.");
}
