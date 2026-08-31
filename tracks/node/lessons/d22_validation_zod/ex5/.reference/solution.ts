// d22_validation_zod / ex5 - reference solution (author only, used by `dojo verify`).
import express, { type Express } from "express";
import { z, type ZodTypeAny } from "zod";

const bookShape = { title: z.string().min(1), pages: z.number().int().positive() };

export const stripSchema = z.object(bookShape);
export const strictSchema = z.object(bookShape).strict();
export const passthroughSchema = z.object(bookShape).passthrough();

/** Parse, or answer 400 - telling an unknown key apart from a bad one. */
function handle(schema: ZodTypeAny, body: unknown, res: express.Response): void {
  const result = schema.safeParse(body);
  if (result.success) {
    res.status(201).json(result.data);
    return;
  }

  // unrecognized_keys carries the offending names, which is the only reason
  // strict() is worth more than a 400 with no detail.
  const unknown = result.error.issues.find((issue) => issue.code === "unrecognized_keys");
  if (unknown !== undefined) {
    res.status(400).json({ error: "unknown_fields", keys: unknown.keys });
    return;
  }

  res.status(400).json({
    error: "validation_failed",
    issues: result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  });
}

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.post("/strip", (req, res) => handle(stripSchema, req.body, res));
  app.post("/strict", (req, res) => handle(strictSchema, req.body, res));
  app.post("/passthrough", (req, res) => handle(passthroughSchema, req.body, res));

  return app;
}
