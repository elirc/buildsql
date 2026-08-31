// d23_rest_patterns / ex2 - reference solution (author only, used by `dojo verify`).
import express, { type Express } from "express";

export interface Task {
  id: string;
  title: string;
  done: boolean;
  owner: string;
  createdAt: string;
}

const FIELDS = ["id", "title", "done", "owner", "createdAt"] as const;
type Field = (typeof FIELDS)[number];

const SEED: Task[] = [
  {
    id: "seed-1",
    title: "write the spec",
    done: false,
    owner: "ada",
    createdAt: "2026-01-05T09:00:00.000Z",
  },
  {
    id: "seed-2",
    title: "review the pull request",
    done: true,
    owner: "grace",
    createdAt: "2026-01-06T11:30:00.000Z",
  },
];

type Selection = { ok: true; fields: Field[] | null } | { ok: false; field: string };

/** null means "everything" - an absent parameter and an empty one both mean it. */
function selectionFrom(raw: unknown): Selection {
  if (typeof raw !== "string" || raw.trim() === "") return { ok: true, fields: null };

  const wanted = raw.split(",").map((field) => field.trim());
  for (const field of wanted) {
    if (!(FIELDS as readonly string[]).includes(field)) return { ok: false, field };
  }
  return { ok: true, fields: wanted as Field[] };
}

function project(task: Task, fields: Field[] | null): Partial<Task> {
  if (fields === null) return task;
  // id first and unconditionally: a resource the client cannot identify is not
  // worth sending, and a Set keeps an explicit id from arriving twice.
  const projected: Partial<Task> = { id: task.id };
  for (const field of new Set(fields)) {
    (projected as Record<string, unknown>)[field] = task[field];
  }
  return projected;
}

export function createApp(): Express {
  const app = express();
  const tasks = SEED.map((task) => ({ ...task }));

  app.get("/tasks", (req, res) => {
    const selection = selectionFrom(req.query.fields);
    if (!selection.ok) {
      res.status(400).json({ error: "unknown_field", field: selection.field });
      return;
    }

    const items = tasks.map((task) => project(task, selection.fields));
    res.json({ items, total: tasks.length });
  });

  app.get("/tasks/:id", (req, res) => {
    const selection = selectionFrom(req.query.fields);
    if (!selection.ok) {
      res.status(400).json({ error: "unknown_field", field: selection.field });
      return;
    }

    const task = tasks.find((candidate) => candidate.id === req.params.id);
    if (task === undefined) {
      res.status(404).json({ error: "not_found" });
      return;
    }

    res.json(project(task, selection.fields));
  });

  return app;
}
