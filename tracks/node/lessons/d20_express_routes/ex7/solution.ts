// d20_express_routes / ex7 - write the five routes once, mount them anywhere.
// See lessons/d20_express_routes/README.md, "Problem 7".
import { type Express } from "express";

export interface ResourceRecord {
  id: string;
  title: string;
}

/** Storage is somebody else's problem: the spec hands you one of these. */
export interface ResourceStore {
  list(): ResourceRecord[];
  get(id: string): ResourceRecord | undefined;
  create(input: { title: string }): ResourceRecord;
  update(id: string, input: { title: string }): ResourceRecord | undefined;
  remove(id: string): boolean;
}

export interface ResourceSpec {
  /** The path segment, e.g. "notes" for /notes and /notes/:id. */
  name: string;
  store: ResourceStore;
}

/**
 * Register the five conventional routes for `spec` on `app`: list, create,
 * show, replace, destroy. Mounting two specs on one app must produce two
 * independent working sets of routes.
 */
export function mountResource(app: Express, spec: ResourceSpec): void {
  throw new Error("ex7: mountResource() is not implemented yet - edit this file.");
}
