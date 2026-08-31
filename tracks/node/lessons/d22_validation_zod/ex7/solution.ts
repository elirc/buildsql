// d22_validation_zod / ex7 - the error document a client can actually use.
// See lessons/d22_validation_zod/README.md, "Problem 7".
import { type ZodError } from "zod";

export interface ProblemIssue {
  /** items[0].qty, meta.owner, name - and "(root)" when there is no path. */
  path: string;
  code: string;
  message: string;
}

export interface Problem {
  error: string;
  issues: ProblemIssue[];
}

/** Render a ZodError as a stable, snapshot-able API error document. */
export function toProblem(error: ZodError): Problem {
  throw new Error("ex7: toProblem() is not implemented yet - edit this file.");
}
