// d22_validation_zod / ex8 - reference solution (author only, used by `dojo verify`).
import express, { type Express } from "express";
import { z } from "zod";

export const MAX_DEPTH = 3;

export interface Category {
  name: string;
  children: Category[];
}

// The annotation is not optional: without it TypeScript cannot infer the type
// of something defined in terms of itself, and z.lazy() defers the evaluation
// so the reference to `categoryNode` inside is resolved at parse time.
const categoryNode: z.ZodType<Category> = z.lazy(() =>
  z.object({
    name: z.string().min(1),
    children: z.array(categoryNode).default([]),
  }),
);

/** ["children", 1, "name"] -> "children[1].name". */
function renderPath(path: (string | number)[]): string {
  return path.reduce<string>((rendered, segment) => {
    if (typeof segment === "number") return `${rendered}[${segment}]`;
    return rendered === "" ? segment : `${rendered}.${segment}`;
  }, "");
}

function depthOf(node: Category): number {
  return 1 + Math.max(0, ...node.children.map(depthOf));
}

export const categorySchema = categoryNode.superRefine((value, ctx) => {
  // The depth rule cannot live on the node schema: a node has no idea how far
  // down it sits. It belongs to the whole tree, walked from the root.
  const walk = (node: Category, depth: number, path: (string | number)[]): void => {
    if (depth > MAX_DEPTH) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [...path, "name"],
        message: `a category tree may be at most ${MAX_DEPTH} levels deep`,
      });
      return;
    }
    node.children.forEach((child, index) => {
      walk(child, depth + 1, [...path, "children", index]);
    });
  };

  walk(value, 1, []);
});

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.post("/categories", (req, res) => {
    const result = categorySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: "invalid_category",
        issues: result.error.issues.map((issue) => ({
          path: renderPath(issue.path),
          message: issue.message,
        })),
      });
      return;
    }

    res.status(201).json({ depth: depthOf(result.data) });
  });

  return app;
}
