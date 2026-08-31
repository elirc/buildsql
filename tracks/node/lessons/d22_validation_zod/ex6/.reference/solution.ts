// d22_validation_zod / ex6 - reference solution (author only, used by `dojo verify`).
import express, { type Express, type RequestHandler } from "express";
import { z, type ZodTypeAny } from "zod";

export interface ValidationSchemas {
  params?: ZodTypeAny;
  query?: ZodTypeAny;
  body?: ZodTypeAny;
}

export interface ValidatedRequest {
  valid: { params?: unknown; query?: unknown; body?: unknown };
}

const PARTS = ["params", "query", "body"] as const;

export function validate(schemas: ValidationSchemas): RequestHandler {
  return (req, res, next) => {
    const issues: { path: string; message: string }[] = [];
    const valid: ValidatedRequest["valid"] = {};

    for (const part of PARTS) {
      const schema = schemas[part];
      if (schema === undefined) continue;

      const result = schema.safeParse(req[part]);
      if (result.success) {
        valid[part] = result.data;
        continue;
      }
      // Keep going: the client wants every problem, not the first one.
      for (const issue of result.error.issues) {
        const tail = issue.path.join(".");
        issues.push({ path: tail === "" ? part : `${part}.${tail}`, message: issue.message });
      }
    }

    if (issues.length > 0) {
      res.status(400).json({ error: "validation_failed", issues });
      return;
    }

    // req.query is a getter in express 5 - assigning to it throws, so the
    // parsed request lives in a place of its own.
    (req as unknown as ValidatedRequest).valid = valid;
    next();
  };
}

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.patch(
    "/projects/:id/tasks",
    validate({
      params: z.object({ id: z.string().regex(/^proj-\d+$/) }),
      query: z.object({ dryRun: z.enum(["true", "false"]).default("false") }),
      body: z.object({ title: z.string().min(1) }),
    }),
    (req, res) => {
      res.json((req as unknown as ValidatedRequest).valid);
    },
  );

  return app;
}
