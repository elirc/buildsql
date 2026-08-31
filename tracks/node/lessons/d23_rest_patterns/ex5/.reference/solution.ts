// d23_rest_patterns / ex5 - reference solution (author only, used by `dojo verify`).
import express, { type Express, type RequestHandler } from "express";

export interface Project {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
}

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  const projects: Project[] = [
    { id: "p-1", name: "Website" },
    { id: "p-2", name: "Mobile" },
  ];
  const tasks: Task[] = [
    { id: "t-1", projectId: "p-1", title: "draw the wireframes" },
    { id: "t-2", projectId: "p-2", title: "choose a crash reporter" },
  ];
  let nextId = 1;

  // The parent is checked once, in front of every nested route. Repeating it
  // per route is how one of them ends up without it.
  const requireProject: RequestHandler = (req, res, next) => {
    const exists = projects.some((project) => project.id === req.params.projectId);
    if (!exists) {
      res.status(404).json({ error: "project_not_found" });
      return;
    }
    next();
  };

  app.get("/projects/:projectId/tasks", requireProject, (req, res) => {
    const items = tasks.filter((task) => task.projectId === req.params.projectId);
    res.json({ items, total: items.length });
  });

  app.post("/projects/:projectId/tasks", requireProject, (req, res) => {
    const title = (req.body as { title?: unknown }).title;
    if (typeof title !== "string" || title === "") {
      res.status(400).json({ error: "invalid_body" });
      return;
    }

    const task: Task = { id: `task-${nextId}`, projectId: req.params.projectId, title };
    nextId += 1;
    tasks.push(task);
    // The nested url, because that is where the resource actually lives.
    res.status(201).location(`/projects/${task.projectId}/tasks/${task.id}`).json(task);
  });

  app.get("/projects/:projectId/tasks/:id", requireProject, (req, res) => {
    const task = tasks.find(
      // BOTH halves. Looking the task up by id alone is the bug that shows one
      // customer another customer data through a url they guessed.
      (candidate) =>
        candidate.id === req.params.id && candidate.projectId === req.params.projectId,
    );
    if (task === undefined) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json(task);
  });

  return app;
}
