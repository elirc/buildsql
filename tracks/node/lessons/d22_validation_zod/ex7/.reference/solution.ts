// d22_validation_zod / ex7 - reference solution (author only, used by `dojo verify`).
import { type ZodError } from "zod";

export interface ProblemIssue {
  path: string;
  code: string;
  message: string;
}

export interface Problem {
  error: string;
  issues: ProblemIssue[];
}

/**
 * ["items", 0, "qty"] -> "items[0].qty".
 *
 * A number is an array index and binds tight to what came before it; a string
 * is a key and takes a dot, unless it is the first thing in the path.
 */
function renderPath(path: (string | number)[]): string {
  if (path.length === 0) return "(root)";
  return path.reduce<string>((rendered, segment) => {
    if (typeof segment === "number") return `${rendered}[${segment}]`;
    return rendered === "" ? segment : `${rendered}.${segment}`;
  }, "");
}

export function toProblem(error: ZodError): Problem {
  return {
    error: "validation_failed",
    // zod's own order is already stable and meaningful (schema order, with the
    // object-level issues last), so it is kept rather than sorted.
    issues: error.issues.map((issue) => ({
      path: renderPath(issue.path),
      code: issue.code,
      // An invalid_union carries the failures of every branch in unionErrors.
      // They contradict each other by construction, so the union's own message
      // is the honest one to show.
      message: issue.message,
    })),
  };
}
