// d11_custom_errors / ex8 - reference solution (author only, used by `dojo verify`).

export interface Issue {
  path: string;
  code: string;
  message: string;
}

export type Rule = (value: unknown, path: string) => Issue | null;

export class ValidationFailed extends Error {
  readonly issues: readonly Issue[];

  constructor(issues: readonly Issue[]) {
    super(`validation failed (${issues.length} issues)`);
    this.name = "ValidationFailed";
    this.issues = [...issues];
  }

  // JSON.stringify calls this. Without it an Error serialises to {} - its own
  // properties are non-enumerable - and the whole report is lost.
  toJSON(): { name: string; message: string; issues: Issue[] } {
    return { name: this.name, message: this.message, issues: [...this.issues] };
  }
}

export function validate(
  input: Record<string, unknown>,
  rules: Record<string, Rule[]>,
): void {
  const issues: Issue[] = [];

  for (const [path, forPath] of Object.entries(rules)) {
    for (const rule of forPath) {
      // No early exit anywhere: the caller wants every problem in one round
      // trip, not one per resubmission.
      const issue = rule(input[path], path);
      if (issue) issues.push(issue);
    }
  }

  if (issues.length > 0) throw new ValidationFailed(issues);
}
