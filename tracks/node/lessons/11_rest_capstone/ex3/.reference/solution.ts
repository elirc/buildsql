// 11_rest_capstone / ex3 - reference solution (author only, used by `dojo verify`).
import express, { type Express } from "express";
import { z, type ZodSchema } from "zod";

export type TaskStatus = "todo" | "doing" | "done";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
}

export const statusSchema = z.enum(["todo", "doing", "done"]);

export const createTaskSchema = z.object({
  title: z.string().min(1),
  status: statusSchema.optional(),
});

export const patchTaskSchema = z.object({
  title: z.string().min(1).optional(),
  status: statusSchema.optional(),
});

export const SEED: Task[] = [
  { id: "seed-1", title: "write the readme", status: "done" },
  { id: "seed-2", title: "ship it", status: "todo" },
];

function parseOr400<T>(schema: ZodSchema<T>, body: unknown, res: express.Response): T | null {
  const result = schema.safeParse(body);
  if (result.success) return result.data;

  res.status(400).json({
    error: "validation_failed",
    details: result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  });
  return null;
}

export function createApp(): Express {
  const app = express();
  const tasks: Task[] = SEED.map((task) => ({ ...task }));
  let nextId = 1;

  app.use(express.json());

  app.post("/tasks", (req, res) => {
    const input = parseOr400(createTaskSchema, req.body, res);
    if (input === null) return;

    const task: Task = {
      id: `task-${nextId}`,
      title: input.title,
      status: input.status ?? "todo",
    };
    nextId += 1;
    tasks.push(task);

    res.setHeader("location", `/tasks/${task.id}`);
    res.status(201).json(task);
  });

  app.patch("/tasks/:id", (req, res) => {
    const patch = parseOr400(patchTaskSchema, req.body, res);
    if (patch === null) return;

    const task = tasks.find((candidate) => candidate.id === req.params.id);
    if (task === undefined) {
      res.status(404).json({ error: "not_found", message: "no such task" });
      return;
    }

    if (patch.title !== undefined) task.title = patch.title;
    if (patch.status !== undefined) task.status = patch.status;
    res.json(task);
  });

  app.delete("/tasks/:id", (req, res) => {
    const index = tasks.findIndex((candidate) => candidate.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: "not_found", message: "no such task" });
      return;
    }
    tasks.splice(index, 1);
    res.status(204).end();
  });

  return app;
}
