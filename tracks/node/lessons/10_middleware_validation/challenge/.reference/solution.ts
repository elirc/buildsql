// 10_middleware_validation / challenge - reference solution (author only, used by `dojo verify`).
import express, { type Express, type RequestHandler } from "express";

export interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  now: () => number;
}

interface Bucket {
  count: number;
  start: number;
}

export function createRateLimiter(options: RateLimiterOptions): RequestHandler {
  const buckets = new Map<string, Bucket>();

  return (req, res, next) => {
    const header = req.headers["x-api-key"];
    const key = typeof header === "string" ? header : "anonymous";
    const time = options.now();

    const existing = buckets.get(key);
    const bucket: Bucket =
      existing === undefined || time - existing.start >= options.windowMs
        ? { count: 0, start: time }
        : existing;
    buckets.set(key, bucket);

    if (bucket.count >= options.limit) {
      const msLeft = bucket.start + options.windowMs - time;
      res.setHeader("retry-after", String(Math.ceil(msLeft / 1000)));
      res.status(429).json({ error: "too many requests" });
      return;
    }

    bucket.count += 1;
    res.setHeader("x-ratelimit-limit", String(options.limit));
    res.setHeader("x-ratelimit-remaining", String(options.limit - bucket.count));
    next();
  };
}

export function createApp(options: RateLimiterOptions): Express {
  const app = express();

  app.use(createRateLimiter(options));

  app.get("/ping", (_req, res) => {
    res.json({ pong: true });
  });

  return app;
}
