// d23_rest_patterns / ex6 - the retry that must not charge twice.
// See lessons/d23_rest_patterns/README.md, "Problem 6".
import { type Express } from "express";

/**
 * POST /payments, honouring an `Idempotency-Key` header: one key, one payment,
 * however many times the request arrives.
 */
export function createApp(): Express {
  throw new Error("ex6: createApp() is not implemented yet - edit this file.");
}
