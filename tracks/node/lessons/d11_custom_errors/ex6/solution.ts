// d11_custom_errors / ex6 - extending the aggregate the platform already has.
// See lessons/d11_custom_errors/README.md, "Problem 6".

/**
 * message: `<operation>: <n> failed`, name "BatchError", `errors` a COPY of
 * what was passed in, and `codes()` the distinct string `code` values, sorted.
 */
export class BatchError extends AggregateError {
  readonly operation!: string;

  constructor(operation: string, errors: readonly Error[]) {
    super(errors, "ex6: BatchError is not implemented yet - edit this file.");
    throw new Error("ex6: BatchError is not implemented yet - edit this file.");
  }

  codes(): string[] {
    throw new Error("ex6: BatchError.codes() is not implemented yet - edit this file.");
  }
}
