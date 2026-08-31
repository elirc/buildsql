// d21_middleware / ex8 - answering without running the handler again.
// See lessons/d21_middleware/README.md, "Problem 8".
import { type RequestHandler } from "express";

export interface ResponseCacheOptions {
  /** How long a stored answer stays fresh, in milliseconds. */
  ttl: number;
  /** The clock. Injected, so expiry is decided rather than waited for. */
  now: () => number;
}

/**
 * Caches successful `GET` responses per method and url, replaying them with
 * `x-cache: HIT` (a fresh one is `MISS`). Never stores a non-2xx, honours
 * `cache-control: no-store` on the request, expires on the injected clock, and
 * drops everything stored for a path when a write arrives at it.
 */
export function responseCache(options: ResponseCacheOptions): RequestHandler {
  throw new Error("ex8: responseCache() is not implemented yet - edit this file.");
}
