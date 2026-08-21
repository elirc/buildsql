// 10_guards_assertions / challenge - reference solution (author only).

export interface Submission {
  slug: string;
  attempts: number;
  passed: boolean;
}

export type Validated<T> = { ok: true; value: T } | { ok: false; errors: string[] };

export function validateSubmission(input: unknown): Validated<Submission> {
  if (typeof input !== "object" || input === null) {
    return { ok: false, errors: ["expected an object"] };
  }
  const candidate = input as Record<string, unknown>;
  const errors: string[] = [];
  if (typeof candidate.slug !== "string") {
    errors.push("slug must be a string");
  }
  if (typeof candidate.attempts !== "number") {
    errors.push("attempts must be a number");
  }
  if (typeof candidate.passed !== "boolean") {
    errors.push("passed must be a boolean");
  }
  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    value: {
      slug: candidate.slug as string,
      attempts: candidate.attempts as number,
      passed: candidate.passed as boolean,
    },
  };
}
