// d23_rest_patterns / ex8 - reference solution (author only, used by `dojo verify`).
import express, { type Express, type Request, type Response } from "express";

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  status: "open" | "done";
  subtasks: Subtask[];
}

export interface Deps {
  seed?: Task[];
}

interface Problem {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

const FIELDS = ["id", "title", "status", "subtasks"] as const;
type Field = (typeof FIELDS)[number];

const DEFAULT_LIMIT = 2;
const MAX_LIMIT = 3;

const DEFAULT_SEED: Task[] = [
  { id: "t-1", title: "write the spec", status: "open", subtasks: [] },
  { id: "t-2", title: "review the pull request", status: "open", subtasks: [] },
];

/** Every failure in this service goes out through here. */
function sendProblem(
  res: Response,
  req: Request,
  parts: { type?: string; title: string; status: number; detail: string },
): void {
  const problem: Problem = {
    type: parts.type ?? "about:blank",
    title: parts.title,
    status: parts.status,
    detail: parts.detail,
    instance: req.originalUrl,
  };
  res.status(problem.status).type("application/problem+json").json(problem);
}

const encodeCursor = (id: string): string => Buffer.from(id, "utf8").toString("base64url");
const decodeCursor = (cursor: string): string => Buffer.from(cursor, "base64url").toString("utf8");

function project(task: Task, fields: Field[] | null): Partial<Task> {
  if (fields === null) return task;
  const projected: Partial<Task> = { id: task.id };
  for (const field of new Set(fields)) {
    (projected as Record<string, unknown>)[field] = task[field];
  }
  return projected;
}

export function createApp(deps: Deps = {}): Express {
  const app = express();
  app.use(express.json());

  // A copy, so a caller cannot mutate the service by holding on to its seed.
  const tasks: Task[] = (deps.seed ?? DEFAULT_SEED).map((task) => ({
    ...task,
    subtasks: task.subtasks.map((subtask) => ({ ...subtask })),
  }));
  let nextId = 1;

  app.get("/tasks", (req, res) => {
    const rawFields = req.query.fields;
    let fields: Field[] | null = null;
    if (typeof rawFields === "string" && rawFields.trim() !== "") {
      const wanted = rawFields.split(",").map((field) => field.trim());
      const unknown = wanted.find((field) => !(FIELDS as readonly string[]).includes(field));
      if (unknown !== undefined) {
        sendProblem(res, req, {
          title: "Bad Request",
          status: 400,
          detail: `unknown field ${unknown}`,
        });
        return;
      }
      fields = wanted as Field[];
    }

    const parsed = Number(req.query.limit);
    const limit = Number.isInteger(parsed) && parsed >= 1 ? Math.min(parsed, MAX_LIMIT) : DEFAULT_LIMIT;

    let start = 0;
    if (typeof req.query.cursor === "string" && req.query.cursor !== "") {
      const index = tasks.findIndex((task) => task.id === decodeCursor(req.query.cursor as string));
      if (index === -1) {
        sendProblem(res, req, {
          title: "Bad Request",
          status: 400,
          detail: "cursor does not name a task in this collection",
        });
        return;
      }
      start = index + 1;
    }

    const page = tasks.slice(start, start + limit);
    const last = page[page.length - 1];
    const more = last !== undefined && start + page.length < tasks.length;

    res.json({
      items: page.map((task) => project(task, fields)),
      nextCursor: more ? encodeCursor(last.id) : null,
    });
  });

  app.post("/tasks", (req, res) => {
    const title = (req.body as { title?: unknown }).title;
    if (typeof title !== "string" || title === "") {
      sendProblem(res, req, { title: "Bad Request", status: 400, detail: "title is required" });
      return;
    }

    const task: Task = { id: `task-${nextId}`, title, status: "open", subtasks: [] };
    nextId += 1;
    tasks.push(task);
    res.status(201).location(`/tasks/${task.id}`).json(task);
  });

  app.get("/tasks/:id", (req, res) => {
    const task = tasks.find((candidate) => candidate.id === req.params.id);
    if (task === undefined) {
      sendProblem(res, req, {
        title: "Not Found",
        status: 404,
        detail: `no task with id ${req.params.id}`,
      });
      return;
    }
    res.json(task);
  });

  app.patch("/tasks/:id", (req, res) => {
    const task = tasks.find((candidate) => candidate.id === req.params.id);
    if (task === undefined) {
      sendProblem(res, req, {
        title: "Not Found",
        status: 404,
        detail: `no task with id ${req.params.id}`,
      });
      return;
    }

    const patch = req.body as { title?: unknown; status?: unknown };
    if (patch.status === "done") {
      const open = task.subtasks.filter((subtask) => !subtask.done);
      if (open.length > 0) {
        // The request was perfectly well formed; the state of the world is
        // what refused it. That is a 409, not a 400.
        sendProblem(res, req, {
          type: "https://example.com/probs/open-subtasks",
          title: "Conflict",
          status: 409,
          detail: `task ${task.id} still has ${open.length} open subtask(s)`,
        });
        return;
      }
    }

    if (typeof patch.title === "string" && patch.title !== "") task.title = patch.title;
    if (patch.status === "open" || patch.status === "done") task.status = patch.status;
    res.json(task);
  });

  app.patch("/tasks/:id/subtasks/:subtaskId", (req, res) => {
    const task = tasks.find((candidate) => candidate.id === req.params.id);
    const subtask = task?.subtasks.find((candidate) => candidate.id === req.params.subtaskId);
    if (task === undefined || subtask === undefined) {
      sendProblem(res, req, {
        title: "Not Found",
        status: 404,
        detail: `no subtask ${req.params.subtaskId} on task ${req.params.id}`,
      });
      return;
    }

    const done = (req.body as { done?: unknown }).done;
    if (typeof done !== "boolean") {
      sendProblem(res, req, { title: "Bad Request", status: 400, detail: "done must be a boolean" });
      return;
    }

    subtask.done = done;
    res.json(task);
  });

  app.delete("/tasks/:id", (req, res) => {
    const index = tasks.findIndex((candidate) => candidate.id === req.params.id);
    if (index === -1) {
      sendProblem(res, req, {
        title: "Not Found",
        status: 404,
        detail: `no task with id ${req.params.id}`,
      });
      return;
    }

    tasks.splice(index, 1);
    res.status(204).end();
  });

  // An unmatched route is a failure like any other, in the same shape.
  app.use((req, res) => {
    sendProblem(res, req, { title: "Not Found", status: 404, detail: "no such route" });
  });

  return app;
}
