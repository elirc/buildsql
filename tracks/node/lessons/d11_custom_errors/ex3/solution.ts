// d11_custom_errors / ex3 - an error you can put in a log line.
// See lessons/d11_custom_errors/README.md, "Problem 3".

export interface SerialisedError {
  name: string;
  message: string;
  code?: string;
  status?: number;
  cause?: SerialisedError;
}

/**
 * name and message always; `code` when it is a string and `status` when it is a
 * number; `cause` recursed when it is an Error. Absent keys are OMITTED, the
 * stack is never included, and a cause chain that loops must terminate.
 */
export function serialiseError(error: Error): SerialisedError {
  throw new Error("ex3: serialiseError() is not implemented yet - edit this file.");
}
