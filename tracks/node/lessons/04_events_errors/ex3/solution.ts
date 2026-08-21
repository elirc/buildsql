// 04_events_errors / ex3 - errors with an identity.
// See lessons/04_events_errors/README.md, "Exercise 3".

export class ValidationError extends Error {
  readonly field!: string;
  readonly status!: number;
  readonly isOperational!: boolean;

  constructor(field: string, message: string) {
    super(message);
    throw new Error("ex3: ValidationError is not implemented yet - edit this file.");
  }
}

export function classifyError(error: unknown): "operational" | "programmer" {
  throw new Error("ex3: classifyError() is not implemented yet - edit this file.");
}
