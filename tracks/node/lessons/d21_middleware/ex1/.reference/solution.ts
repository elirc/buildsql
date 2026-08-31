// d21_middleware / ex1 - reference solution (author only, used by `dojo verify`).
import { type RequestHandler, type Response } from "express";

export interface TimingOptions {
  now: () => number;
}

export function timing(options: TimingOptions): RequestHandler {
  return (_req, res, next) => {
    const start = options.now();

    // res.end() is the one funnel every response goes through - res.json(),
    // res.send(), a 404 from express itself. Wrapping it is how you get a
    // last word before the headers are committed; res.on("finish") is one
    // moment too late, because by then they are already on the wire.
    const originalEnd = res.end.bind(res) as (...args: unknown[]) => Response;
    res.end = ((...args: unknown[]) => {
      if (!res.headersSent) {
        res.setHeader("x-response-time", String(options.now() - start));
      }
      return originalEnd(...args);
    }) as typeof res.end;

    next();
  };
}
