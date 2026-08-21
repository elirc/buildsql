// 11_rest_capstone / ex4 - reference solution (author only, used by `dojo verify`).
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { z, type ZodSchema } from "zod";

export type TaskStatus = "todo" | "doing" | "done";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
}

export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
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
  { id: "seed-3", title: "review the pull request", status: "doing" },
];

class ValidationError extends AppError {
  constructor(readonly details: { path: string; message: string }[]) {
    super(400, "validation_failed", "the request body is not valid");
  }
}

function parse<T>(schema: ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (result.success) return result.data;
  throw new ValidationError(
    result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  );
}

export function createApp(): Express {
  const app = express();
  const tasks: Task[] = SEED.map((task) => ({ ...task }));
  let nextId = 1;
  let requests = 0;

  app.use((_req, res, next) => {
    requests += 1;
    res.setHeader("x-request-id", `req-${requests}`);
    next();
  });

  app.use(express.json());

  app.get("/tasks", (req, res) => {
    const status = req.query.status;
    if (status !== undefined) {
      const parsed = statusSchema.safeParse(status);
      if (!parsed.success) {
        throw new AppError(400, "invalid_status", "status must be one of todo, doing, done");
      }
    }
    const items = status === undefined
      ? tasks
      : tasks.filter((task) => task.status === status);
    res.json({ items: items.map((task) => ({ ...task })), total: items.length });
  });

  app.get("/tasks/:id", (req, res) => {
    res.json(find(tasks, req.params.id));
  });

  app.post("/tasks", (req, res) => {
    const input = parse(createTaskSchema, req.body);
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
    const patch = parse(patchTaskSchema, req.body);
    const task = find(tasks, req.params.id);
    if (patch.title !== undefined) task.title = patch.title;
    if (patch.status !== undefined) task.status = patch.status;
    res.json(task);
  });

  app.delete("/tasks/:id", (req, res) => {
    const index = tasks.findIndex((task) => task.id === req.params.id);
    if (index === -1) throw new AppError(404, "not_found", "no such task");
    tasks.splice(index, 1);
    res.status(204).end();
  });

  app.use((_req, _res, next: NextFunction) => {
    next(new AppError(404, "not_found", "no such route"));
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof ValidationError) {
      res.status(error.status).json({ error: error.code, details: error.details });
      return;
    }
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.code, message: error.message });
      return;
    }
    res.status(500).json({ error: "internal_error", message: "internal server error" });
  });

  return app;
}

function find(tasks: Task[], id: string): Task {
  const task = tasks.find((candidate) => candidate.id === id);
  if (task === undefined) throw new AppError(404, "not_found", "no such task");
  return task;
}
