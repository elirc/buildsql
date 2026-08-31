// d21_middleware / ex8 - reference solution (author only, used by `dojo verify`).
import { type RequestHandler } from "express";

export interface ResponseCacheOptions {
  ttl: number;
  now: () => number;
}

interface Entry {
  /** Kept so a write to this path can find every entry belonging to it. */
  path: string;
  status: number;
  body: unknown;
  expiresAt: number;
}

export function responseCache(options: ResponseCacheOptions): RequestHandler {
  const store = new Map<string, Entry>();

  return (req, res, next) => {
    // A write is never answered from a cache, and it makes what is stored for
    // its path wrong - so it clears it on the way in.
    if (req.method !== "GET") {
      for (const [key, entry] of store) {
        if (entry.path === req.path) store.delete(key);
      }
      next();
      return;
    }

    // no-store is an instruction, not a hint: do not read, do not write.
    if ((req.get("cache-control") ?? "").includes("no-store")) {
      res.setHeader("x-cache", "MISS");
      next();
      return;
    }

    const key = `${req.method} ${req.originalUrl}`;
    const cached = store.get(key);
    if (cached !== undefined && cached.expiresAt > options.now()) {
      res.setHeader("x-cache", "HIT");
      res.status(cached.status).json(cached.body);
      return;
    }
    // Expired entries are dropped rather than left to rot in the map.
    if (cached !== undefined) store.delete(key);

    res.setHeader("x-cache", "MISS");

    // res.json() is where the body still exists as a value. After it, the
    // response is bytes on a socket and there is nothing left to keep.
    const originalJson = res.json.bind(res);
    res.json = ((body: unknown) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        store.set(key, {
          path: req.path,
          status: res.statusCode,
          body,
          expiresAt: options.now() + options.ttl,
        });
      }
      return originalJson(body);
    }) as typeof res.json;

    next();
  };
}
