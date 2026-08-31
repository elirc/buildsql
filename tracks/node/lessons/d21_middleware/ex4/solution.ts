// d21_middleware / ex4 - two error handlers, and knowing when to give up.
// See lessons/d21_middleware/README.md, "Problem 4".
import { type ErrorRequestHandler, type Express } from "express";

export interface ErrorAppHooks {
  /** Called with one line per error nobody could handle. */
  log: (message: string) => void;
}

/**
 * The last error handler in the stack. Answers `500 { error: "internal_error",
 * message: "internal server error", touched }` — but only while there is still
 * a response to send; once `res.headersSent` is true it delegates with
 * `next(error)` instead.
 */
export const finalErrorHandler: ErrorRequestHandler = () => {
  throw new Error("ex4: finalErrorHandler is not implemented yet - edit this file.");
};

/**
 * An app with `/ok`, `/known` (fails with something the first error handler
 * recognises) and `/unknown` (fails with something it does not), a plain
 * middleware between the two error handlers, and `finalErrorHandler` at the
 * bottom.
 */
export function createApp(hooks: ErrorAppHooks): Express {
  throw new Error("ex4: createApp() is not implemented yet - edit this file.");
}
