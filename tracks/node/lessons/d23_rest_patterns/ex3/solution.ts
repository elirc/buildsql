// d23_rest_patterns / ex3 - one error shape for the whole API.
// See lessons/d23_rest_patterns/README.md, "Problem 3".
import { type Express } from "express";

/** The five members of an RFC 9457 problem document. */
export interface Problem {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

export interface ProblemInput {
  /** Defaults to "about:blank" when the problem needs no identity of its own. */
  type?: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

/** Build a problem document, filling in the parts that have defaults. */
export function problem(input: ProblemInput): Problem {
  throw new Error("ex3: problem() is not implemented yet - edit this file.");
}

/** An app whose every failure is a problem document, logged but never leaked. */
export function createApp(logError: (error: unknown) => void = () => {}): Express {
  throw new Error("ex3: createApp() is not implemented yet - edit this file.");
}
