// d21_middleware / ex2 - reference solution (author only, used by `dojo verify`).
import { type Request, type RequestHandler } from "express";

export function only(
  predicate: (req: Request) => boolean,
  middleware: RequestHandler,
): RequestHandler {
  return (req, res, next) => {
    if (!predicate(req)) {
      // Skipping is an explicit next(), not a return: a middleware that
      // returns without calling next() leaves the request hanging.
      next();
      return;
    }
    // A pass-through, not a catch: next(error) and next("route") both have to
    // reach the caller exactly as the wrapped middleware sent them.
    middleware(req, res, next);
  };
}
