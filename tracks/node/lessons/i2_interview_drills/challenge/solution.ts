// i2_interview_drills / challenge - the 45-minute take-home, in one file.
// See lessons/i2_interview_drills/README.md, "Challenge".
import express, { type Express } from "express";
import { z } from "zod";

export interface Article {
  id: string;
  title: string;
  tag: "node" | "http" | "streams";
}

/** Provided: the schema and the seed data. */
export const createArticleSchema = z.object({
  title: z.string().min(1),
  tag: z.enum(["node", "http", "streams"]),
});

export const SEED: Article[] = [
  { id: "a-1", title: "Streams in anger", tag: "node" },
  { id: "a-2", title: "The event loop, again", tag: "node" },
  { id: "a-3", title: "Backpressure explained", tag: "streams" },
];

export function createApp(): Express {
  throw new Error("challenge: createApp() is not implemented yet - edit this file.");
}
