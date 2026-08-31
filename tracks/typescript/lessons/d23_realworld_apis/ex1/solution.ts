// d23_realworld_apis / ex1 - a result you have to look inside.
// See lessons/d23_realworld_apis/README.md, "ex1".
//
// The stubs return loose Result types and throw, so nothing
// narrows and nothing runs.

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export function ok<T>(value: T): Result<unknown, never> {
  throw new Error("ex1: ok() is not implemented yet - edit this file.");
}

export function err<E>(error: E): Result<never, unknown> {
  throw new Error("ex1: err() is not implemented yet - edit this file.");
}

export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): unknown {
  throw new Error("ex1: unwrapOr() is not implemented yet - edit this file.");
}
