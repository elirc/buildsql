// d22_validation_zod / ex6 - a request has three places to get wrong.
// See lessons/d22_validation_zod/README.md, "Problem 6".
import { type Express, type RequestHandler } from "express";
import { type ZodTypeAny } from "zod";

export interface ValidationSchemas {
  params?: ZodTypeAny;
  query?: ZodTypeAny;
  body?: ZodTypeAny;
}

/** What the middleware leaves behind for the handler. */
export interface ValidatedRequest {
  valid: { params?: unknown; query?: unknown; body?: unknown };
}

/**
 * Validate any of `params`, `query` and `body`, put the parsed results on
 * `req.valid`, and report every part that failed in one 400.
 */
export function validate(schemas: ValidationSchemas): RequestHandler {
  throw new Error("ex6: validate() is not implemented yet - edit this file.");
}

/** PATCH /projects/:id/tasks - answers with what validate() parsed. */
export function createApp(): Express {
  throw new Error("ex6: createApp() is not implemented yet - edit this file.");
}
