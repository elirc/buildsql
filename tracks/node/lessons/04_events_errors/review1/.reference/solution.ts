// 04_events_errors / review1 - reference solution (author only, used by `dojo verify`).

export function wrapError(error: Error, context: string): Error {
  return new Error(`${context}: ${error.message}`, { cause: error });
}

export function rootCause(error: Error): Error {
  let current = error;
  while (current.cause instanceof Error) {
    current = current.cause;
  }
  return current;
}
