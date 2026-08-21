// 11_rest_capstone / ex2 - reference solution (author only, used by `dojo verify`).
import express, { type Express } from "express";

export type TaskStatus = "todo" | "doing" | "done";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
}

export const STATUSES: readonly TaskStatus[] = ["todo", "doing", "done"];

export const SEED: Task[] = [
  { id: "seed-1", title: "write the readme", status: "done" },
  { id: "seed-2", title: "ship it", status: "todo" },
  { id: "seed-3", title: "review the pull request", status: "doing" },
];

export function createApp(): Express {
  const app = express();
  const tasks: Task[] = SEED.map((task) => ({ ...task }));

  app.get("/tasks", (req, res) => {
    const status = req.query.status;

    if (status !== undefined) {
      if (typeof status !== "string" || !STATUSES.includes(status as TaskStatus)) {
        res.status(400).json({
          error: "invalid_status",
          message: "status must be one of todo, doing, done",
        });
        return;
      }
    }

    const items = status === undefined
      ? tasks
      : tasks.filter((task) => task.status === status);

    res.json({ items: items.map((task) => ({ ...task })), total: items.length });
  });

  app.get("/tasks/:id", (req, res) => {
    const task = tasks.find((candidate) => candidate.id === req.params.id);
    if (task === undefined) {
      res.status(404).json({ error: "not_found", message: "no such task" });
      return;
    }
    res.json(task);
  });

  app.use((_req, res) => {
    res.status(404).json({ error: "not_found", message: "no such route" });
  });

  return app;
}
