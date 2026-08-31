// d20_express_routes / ex8 - reference solution (author only, used by `dojo verify`).
import express, { type Express } from "express";

export interface Note {
  id: string;
  title: string;
}

export const SEED: Note[] = [{ id: "n1", title: "buy milk" }];

/** The methods a path answers, plus the two the protocol adds for free. */
function allowHeader(methods: string[]): string {
  const advertised = new Set([...methods, "OPTIONS"]);
  if (advertised.has("GET")) advertised.add("HEAD");
  return [...advertised].sort().join(", ");
}

export function createApp(): Express {
  const app = express();
  const notes: Note[] = SEED.map((note) => ({ ...note }));

  app.use(express.json());

  app.get("/notes", (_req, res) => {
    res.json(notes);
  });
  app.post("/notes", (req, res) => {
    const note = { id: `n${notes.length + 1}`, title: String(req.body.title) };
    notes.push(note);
    res.status(201).json(note);
  });

  app.get("/notes/:id", (req, res) => {
    const note = notes.find((candidate) => candidate.id === req.params.id);
    if (note === undefined) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json(note);
  });
  app.patch("/notes/:id", (req, res) => {
    const note = notes.find((candidate) => candidate.id === req.params.id);
    if (note === undefined) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    note.title = String(req.body.title);
    res.json(note);
  });
  app.delete("/notes/:id", (req, res) => {
    const index = notes.findIndex((candidate) => candidate.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    notes.splice(index, 1);
    res.status(204).end();
  });

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // One app.all() per path, AFTER that path's real methods. Express tries the
  // registrations in order, so a method that matched above never reaches here,
  // and a method that did not falls into it - which is the whole trick.
  const paths: { path: string; methods: string[] }[] = [
    { path: "/notes", methods: ["GET", "POST"] },
    { path: "/notes/:id", methods: ["GET", "PATCH", "DELETE"] },
    { path: "/health", methods: ["GET"] },
  ];

  for (const entry of paths) {
    app.all(entry.path, (req, res) => {
      res.setHeader("allow", allowHeader(entry.methods));
      if (req.method === "OPTIONS") {
        // A question about the path, not a refused method.
        res.status(204).end();
        return;
      }
      res.status(405).json({ error: "method_not_allowed" });
    });
  }

  // Nothing above matched the PATH at all.
  app.use((_req, res) => {
    res.status(404).json({ error: "not_found" });
  });

  return app;
}
