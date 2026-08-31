// d11_custom_errors / ex6 - reference solution (author only, used by `dojo verify`).

export class BatchError extends AggregateError {
  readonly operation: string;

  constructor(operation: string, errors: readonly Error[]) {
    // The spread is the copy: AggregateError takes an iterable and builds its
    // own array, but being explicit says the intent out loud.
    super([...errors], `${operation}: ${errors.length} failed`);
    this.name = "BatchError";
    this.operation = operation;
  }

  codes(): string[] {
    const found = new Set<string>();
    for (const error of this.errors as unknown[]) {
      const code = (error as { code?: unknown }).code;
      if (typeof code === "string") found.add(code);
    }
    return [...found].sort();
  }
}
