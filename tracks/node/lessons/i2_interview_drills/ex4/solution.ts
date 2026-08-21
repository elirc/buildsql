// i2_interview_drills / ex4 - a token bucket, as middleware.
// See lessons/i2_interview_drills/README.md, "Drill 4".
import express, { type Express, type RequestHandler } from "express";

export interface BucketOptions {
  /** The most tokens the bucket can hold - and so the biggest burst allowed. */
  capacity: number;
  /** Tokens added per second, continuously. */
  refillPerSecond: number;
  /** Injected clock in milliseconds, so tests never sleep. */
  now: () => number;
}

export function createTokenBucket(options: BucketOptions): RequestHandler {
  throw new Error("ex4: createTokenBucket() is not implemented yet - edit this file.");
}

export function createApp(options: BucketOptions): Express {
  throw new Error("ex4: createApp() is not implemented yet - edit this file.");
}
