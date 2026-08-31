// d20_express_routes / ex3 - reference solution (author only, used by `dojo verify`).
import express, { type Express } from "express";

export interface Note {
  id: string;
  projectId: string;
  title: string;
}

export const SEED: Note[] = [
  { id: "n1", projectId: "p1", title: "buy milk" },
  { id: "n2", projectId: "p1", title: "call ada" },
  { id: "n3", projectId: "p2", title: "write it up" },
];

export const PROJECT_IDS = ["p1", "p2"];

export function createApp(): Express {
  const app = express();
  const notes = SEED.map((note) => ({ ...note }));

  // Without mergeParams the router gets only its OWN parameters, and
  // req.params.projectId is undefined inside every route below.
  const projectNotes = express.Router({ mergeParams: true });

  // One guard for the whole subtree, which is only possible because the router
  // can read the parameter it was mounted under.
  projectNotes.use((req, res, next) => {
    if (!PROJECT_IDS.includes(String(req.params.projectId))) {
      res.status(404).json({ error: "no_such_project" });
      return;
    }
    next();
  });

  projectNotes.get("/notes", (req, res) => {
    const projectId = String(req.params.projectId);
    res.json({
      projectId,
      noteIds: notes.filter((note) => note.projectId === projectId).map((note) => note.id),
    });
  });

  projectNotes.get("/notes/:noteId", (req, res) => {
    const projectId = String(req.params.projectId);
    const note = notes.find(
      (candidate) => candidate.id === req.params.noteId && candidate.projectId === projectId,
    );
    if (note === undefined) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({ projectId, noteId: note.id, title: note.title });
  });

  app.use("/projects/:projectId", projectNotes);

  return app;
}
