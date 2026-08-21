// 10_middleware_validation / challenge - a rate limiter you can test.
// See lessons/10_middleware_validation/README.md, "Challenge".
import express, { type Express, type RequestHandler } from "express";

export interface RateLimiterOptions {
  /** Requests allowed per key per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Injected clock, so tests never sleep. Defaults to Date.now in real use. */
  now: () => number;
}

export function createRateLimiter(options: RateLimiterOptions): RequestHandler {
  throw new Error("challenge: createRateLimiter() is not implemented yet - edit this file.");
}

export function createApp(options: RateLimiterOptions): Express {
  throw new Error("challenge: createApp() is not implemented yet - edit this file.");
}
