// 04_events_errors / ex3 - reference solution (author only, used by `dojo verify`).

export class ValidationError extends Error {
  readonly field: string;
  readonly status = 400;
  readonly isOperational = true;

  constructor(field: string, message: string) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

export function classifyError(error: unknown): "operational" | "programmer" {
  if (!(error instanceof Error)) return "programmer";
  return (error as { isOperational?: boolean }).isOperational === true
    ? "operational"
    : "programmer";
}
