// d21_middleware / ex5 - the body parser refuses; you do the explaining.
// See lessons/d21_middleware/README.md, "Problem 5".
import { type Express } from "express";

/** The most a body may weigh here. Anything larger is a 413. */
export const BODY_LIMIT = 200;

/**
 * `POST /notes` accepts `application/json` up to `BODY_LIMIT` bytes and answers
 * `201 { id: "n1", title }`. Everything else gets one JSON error shape:
 * 413 `payload_too_large`, 400 `invalid_json`, 415 `unsupported_media_type`,
 * 400 `empty_body`.
 */
export function createApp(): Express {
  throw new Error("ex5: createApp() is not implemented yet - edit this file.");
}
