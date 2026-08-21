// 04_events_errors / review1 - context without losing the cause.
// See lessons/04_events_errors/README.md, "Review".

export function wrapError(error: Error, context: string): Error {
  throw new Error("review1: wrapError() is not implemented yet - edit this file.");
}

export function rootCause(error: Error): Error {
  throw new Error("review1: rootCause() is not implemented yet - edit this file.");
}
