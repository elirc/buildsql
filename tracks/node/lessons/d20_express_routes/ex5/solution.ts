// d20_express_routes / ex5 - what a sub-application is actually handed.
// See lessons/d20_express_routes/README.md, "Problem 5".
import { type Express } from "express";

/**
 * A parent app with its own middleware and a `/health` route, and a second
 * express application mounted at `/api/v2` with middleware of its own and a
 * `/notes/:id` route that reports the three url properties.
 */
export function createApp(): Express {
  throw new Error("ex5: createApp() is not implemented yet - edit this file.");
}
