// d23_rest_patterns / ex5 - a resource that only exists inside another one.
// See lessons/d23_rest_patterns/README.md, "Problem 5".
import { type Express } from "express";

/**
 * /projects/:projectId/tasks - list and create under a parent, with a missing
 * parent a 404 and a task never visible through the wrong one.
 */
export function createApp(): Express {
  throw new Error("ex5: createApp() is not implemented yet - edit this file.");
}
