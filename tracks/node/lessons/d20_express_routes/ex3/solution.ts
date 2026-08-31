// d20_express_routes / ex3 - a router that can see where it was mounted.
// See lessons/d20_express_routes/README.md, "Problem 3".
import { type Express } from "express";

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

/**
 * A Router mounted at `/projects/:projectId` serving `/notes` and
 * `/notes/:noteId` — both of which need the project id the mount supplied.
 */
export function createApp(): Express {
  throw new Error("ex3: createApp() is not implemented yet - edit this file.");
}
