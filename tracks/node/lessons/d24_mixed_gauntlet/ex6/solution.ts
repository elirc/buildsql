// d24_mixed_gauntlet / ex6 - HTTP + streams + the filesystem, in one route.
// See lessons/d24_mixed_gauntlet/README.md, "Problem 6".
import type { Express } from "express";

export interface UploadDeps {
  /** Where the bytes are written. The gate hands you a fresh temp directory. */
  dir: string;
  /** Bytes above which the upload is refused. */
  limit: number;
  /** Injected so ids are the server's decision and the gate can predict them. */
  nextId: () => string;
}

/**
 * `POST /uploads` streams the request body to a file and answers 201 with
 * `{ id, bytes }` and a Location header, or 413 leaving nothing behind.
 * `GET /uploads/:id` answers `{ id, bytes }`, or 404.
 */
export function createApp(deps: UploadDeps): Express {
  throw new Error("ex6: createApp() is not implemented yet - edit this file.");
}
