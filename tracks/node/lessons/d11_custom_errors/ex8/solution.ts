// d11_custom_errors / ex8 - one error carrying every problem.
// See lessons/d11_custom_errors/README.md, "Problem 8".

export interface Issue {
  path: string;
  code: string;
  message: string;
}

/** A rule returns an Issue when the value is wrong, or null when it is fine. */
export type Rule = (value: unknown, path: string) => Issue | null;

export class ValidationFailed extends Error {
  readonly issues!: readonly Issue[];

  constructor(issues: readonly Issue[]) {
    super("ex8: ValidationFailed is not implemented yet - edit this file.");
    throw new Error("ex8: ValidationFailed is not implemented yet - edit this file.");
  }

  /** What crosses the wire: name, message, issues. Never the stack. */
  toJSON(): { name: string; message: string; issues: Issue[] } {
    throw new Error("ex8: ValidationFailed.toJSON() is not implemented yet - edit this file.");
  }
}

/**
 * Run EVERY rule for every path, in path order then rule order, collecting all
 * the issues. Throw `ValidationFailed` if there are any; return quietly if not.
 */
export function validate(
  input: Record<string, unknown>,
  rules: Record<string, Rule[]>,
): void {
  throw new Error("ex8: validate() is not implemented yet - edit this file.");
}
