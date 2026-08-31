// d23_rest_patterns / ex7 - reference solution (author only, used by `dojo verify`).
import express, { type Express } from "express";

export interface Task {
  id: string;
  title: string;
}

export type Operation =
  | { op: "create"; title: string }
  | { op: "update"; id: string; title: string }
  | { op: "delete"; id: string };

interface Rejection {
  index: number;
  reason: string;
}

/**
 * Walk the batch as if it were running, against a copy of the id set, and
 * report the first operation that could not be applied.
 *
 * Checking every operation against the ORIGINAL state is the tempting version
 * and it is wrong: two deletes of the same id both pass, and the second one
 * then fails half way through applying the batch.
 */
function reject(operations: unknown[], ids: string[]): Rejection | null {
  const live = new Set(ids);

  for (let index = 0; index < operations.length; index += 1) {
    const operation = operations[index] as Partial<Operation> & { op?: unknown };

    if (operation?.op === "create") {
      if (typeof operation.title !== "string" || operation.title === "") {
        return { index, reason: "create needs a title" };
      }
      continue;
    }

    if (operation?.op === "update" || operation?.op === "delete") {
      const id = (operation as { id?: unknown }).id;
      if (typeof id !== "string" || !live.has(id)) {
        return { index, reason: `no such task: ${String(id)}` };
      }
      if (operation.op === "update" && (typeof operation.title !== "string" || operation.title === "")) {
        return { index, reason: "update needs a title" };
      }
      if (operation.op === "delete") live.delete(id);
      continue;
    }

    return { index, reason: `unknown operation: ${String(operation?.op)}` };
  }

  return null;
}

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  const tasks: Task[] = [
    { id: "t-1", title: "write the spec" },
    { id: "t-2", title: "review the pull request" },
  ];
  let nextId = 1;

  app.get("/tasks", (_req, res) => {
    res.json(tasks);
  });

  app.post("/tasks/bulk", (req, res) => {
    const operations = (req.body as { operations?: unknown }).operations;
    if (!Array.isArray(operations)) {
      res.status(400).json({ error: "invalid_body" });
      return;
    }

    const rejection = reject(operations, tasks.map((task) => task.id));
    if (rejection !== null) {
      // Nothing has been touched yet, which is the whole point of checking
      // first: the client is told no and the store is exactly as it was.
      res.status(422).json({ error: "bulk_failed", ...rejection });
      return;
    }

    const results = (operations as Operation[]).map((operation) => {
      if (operation.op === "create") {
        const task: Task = { id: `task-${nextId}`, title: operation.title };
        nextId += 1;
        tasks.push(task);
        return { op: "create", id: task.id };
      }

      if (operation.op === "update") {
        const task = tasks.find((candidate) => candidate.id === operation.id);
        if (task !== undefined) task.title = operation.title;
        return { op: "update", id: operation.id };
      }

      const index = tasks.findIndex((candidate) => candidate.id === operation.id);
      if (index !== -1) tasks.splice(index, 1);
      return { op: "delete", id: operation.id };
    });

    res.json({ results });
  });

  return app;
}
