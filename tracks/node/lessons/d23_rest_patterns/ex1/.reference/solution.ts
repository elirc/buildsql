// d23_rest_patterns / ex1 - reference solution (author only, used by `dojo verify`).
import express, { type Express, type Response } from "express";

export interface Task {
  id: string;
  title: string;
  done: boolean;
}

function notFound(res: Response): void {
  res.status(404).json({ error: "not_found" });
}

function titleOf(body: unknown): string | null {
  const title = (body as { title?: unknown } | undefined)?.title;
  return typeof title === "string" && title !== "" ? title : null;
}

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  const tasks: Task[] = [{ id: "seed-1", title: "write the spec", done: false }];
  let nextId = 1;

  app.get("/tasks", (_req, res) => {
    res.json(tasks);
  });

  app.post("/tasks", (req, res) => {
    const title = titleOf(req.body);
    if (title === null) {
      res.status(400).json({ error: "invalid_body" });
      return;
    }

    // The SERVER picks the id, so the client can only learn it from Location.
    const task: Task = { id: `task-${nextId}`, title, done: false };
    nextId += 1;
    tasks.push(task);
    res.status(201).location(`/tasks/${task.id}`).json(task);
  });

  app.put("/tasks/:id", (req, res) => {
    const title = titleOf(req.body);
    if (title === null) {
      res.status(400).json({ error: "invalid_body" });
      return;
    }

    // PUT sends a whole representation, so anything it leaves out is absent -
    // not preserved from what used to be there.
    const replacement: Task = {
      id: req.params.id,
      title,
      done: (req.body as { done?: unknown }).done === true,
    };

    const index = tasks.findIndex((task) => task.id === req.params.id);
    if (index === -1) {
      tasks.push(replacement);
      res.status(201).location(`/tasks/${replacement.id}`).json(replacement);
      return;
    }

    tasks[index] = replacement;
    res.json(replacement);
  });

  app.patch("/tasks/:id", (req, res) => {
    const task = tasks.find((candidate) => candidate.id === req.params.id);
    if (task === undefined) {
      // PATCH describes a change to something that exists. There is nothing
      // here to change, and inventing it would be a PUT.
      notFound(res);
      return;
    }

    const patch = req.body as { title?: unknown; done?: unknown };
    if (typeof patch.title === "string" && patch.title !== "") task.title = patch.title;
    if (typeof patch.done === "boolean") task.done = patch.done;
    res.json(task);
  });

  app.delete("/tasks/:id", (req, res) => {
    const index = tasks.findIndex((task) => task.id === req.params.id);
    if (index === -1) {
      notFound(res);
      return;
    }

    tasks.splice(index, 1);
    res.status(204).end();
  });

  return app;
}
