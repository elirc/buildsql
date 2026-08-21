// 10_guards_assertions / challenge - a validator that collects every problem.
// See lessons/10_guards_assertions/README.md, "Challenge".

export interface Submission {
  slug: string;
  attempts: number;
  passed: boolean;
}

export type Validated<T> = { ok: true; value: T };

export function validateSubmission(input: unknown): Validated<Submission> {
  throw new Error("challenge: validateSubmission() is not implemented yet - edit this file.");
}
