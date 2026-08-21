// 10_middleware_validation / ex2 - reference solution (author only, used by `dojo verify`).
import express, { type Express, type RequestHandler } from "express";
import { z, type ZodSchema } from "zod";

export const createOrderSchema = z.object({
  item: z.string().min(1),
  qty: z.number().int().positive(),
});

export function validateBody<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: "validation failed",
        details: result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    // The handler downstream sees the parsed value, not the raw input.
    req.body = result.data;
    next();
  };
}

export function createApp(): Express {
  const app = express();
  let nextId = 1;

  app.use(express.json());

  app.post("/orders", validateBody(createOrderSchema), (req, res) => {
    const order = { id: nextId, ...req.body };
    nextId += 1;
    res.status(201).json(order);
  });

  return app;
}
