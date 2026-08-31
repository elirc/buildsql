// d21_middleware / ex7 - reference solution (author only, used by `dojo verify`).
import { type RequestHandler, type Response } from "express";

export interface ConcurrencyOptions {
  max: number;
  queue: number;
}

export function concurrencyLimit(options: ConcurrencyOptions): RequestHandler {
  let active = 0;
  //: requests holding a place in line, oldest first
  const waiting: (() => void)[] = [];

  /** Hand the slot to the longest waiter, or put it back on the count. */
  const release = (): void => {
    const next = waiting.shift();
    if (next) next();
    else active -= 1;
  };

  /**
   * One release per request, whatever happened to it. "finish" is a response
   * that was sent; "close" is one whose connection went away first. Both have
   * to give the slot back, and neither may give it back twice.
   */
  const releaseOnce = (res: Response): void => {
    let released = false;
    const once = () => {
      if (released) return;
      released = true;
      release();
    };
    res.on("finish", once);
    res.on("close", once);
  };

  return (_req, res, next) => {
    if (active < options.max) {
      active += 1;
      releaseOnce(res);
      next();
      return;
    }

    if (waiting.length < options.queue) {
      // The slot is handed straight over when it comes back, so `active` never
      // dips and a third request cannot slip in between the two.
      waiting.push(() => {
        releaseOnce(res);
        next();
      });
      return;
    }

    res.setHeader("retry-after", "1");
    res.status(503).json({ error: "too_busy" });
  };
}
