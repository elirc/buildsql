// 10_middleware_validation / ex2 - validation as a middleware.
// See lessons/10_middleware_validation/README.md, "Exercise 2".
import express, { type Express, type RequestHandler } from "express";
import { z, type ZodSchema } from "zod";

/** The contract for a new order. Do not change it. */
export const createOrderSchema = z.object({
  item: z.string().min(1),
  qty: z.number().int().positive(),
});

export function validateBody<T>(schema: ZodSchema<T>): RequestHandler {
  throw new Error("ex2: validateBody() is not implemented yet - edit this file.");
}

export function createApp(): Express {
  throw new Error("ex2: createApp() is not implemented yet - edit this file.");
}
