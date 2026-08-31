// d22_validation_zod / ex1 - reference solution (author only, used by `dojo verify`).
import express, { type Express } from "express";
import { z } from "zod";

export const articleQuerySchema = z.object({
  // Everything in a query string arrives as a string, so the schema coerces
  // first and constrains afterwards. default() runs before coercion, which is
  // why an absent parameter is not a failed number.
  limit: z.coerce.number().int().positive().max(50).default(10),
  page: z.coerce.number().int().min(1).default(1),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export function createApp(): Express {
  const app = express();

  app.get("/articles", (req, res) => {
    const result = articleQuerySchema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({
        error: "invalid_query",
        issues: result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          code: issue.code,
          message: issue.message,
        })),
      });
      return;
    }

    res.json(result.data);
  });

  return app;
}
