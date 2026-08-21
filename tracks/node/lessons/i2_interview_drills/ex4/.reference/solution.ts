// i2_interview_drills / ex4 - reference solution (author only, used by `dojo verify`).
import express, { type Express, type RequestHandler } from "express";

export interface BucketOptions {
  capacity: number;
  refillPerSecond: number;
  now: () => number;
}

export function createTokenBucket(options: BucketOptions): RequestHandler {
  let tokens = options.capacity;
  let lastRefill = options.now();

  return (_req, res, next) => {
    const time = options.now();
    const gained = ((time - lastRefill) / 1000) * options.refillPerSecond;
    // The cap is the whole point: an uncapped bucket lets an idle client
    // build up an unlimited burst.
    tokens = Math.min(options.capacity, tokens + gained);
    lastRefill = time;

    if (tokens < 1) {
      const seconds = (1 - tokens) / options.refillPerSecond;
      res.setHeader("retry-after", String(Math.max(1, Math.ceil(seconds))));
      res.status(429).json({ error: "too many requests" });
      return;
    }

    tokens -= 1;
    res.setHeader("x-ratelimit-limit", String(options.capacity));
    res.setHeader("x-ratelimit-remaining", String(Math.floor(tokens)));
    next();
  };
}

export function createApp(options: BucketOptions): Express {
  const app = express();
  app.use(createTokenBucket(options));
  app.get("/ping", (_req, res) => {
    res.json({ pong: true });
  });
  return app;
}
