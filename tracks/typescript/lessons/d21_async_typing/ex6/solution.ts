// d21_async_typing / ex6 - whichever settles first.
// See lessons/d21_async_typing/README.md, "ex6".
//
// The stub promises unknown and throws, so nothing races.

export function withTimeout<T>(
  task: Promise<T>,
  expire: Promise<void>,
  message: string,
): Promise<unknown> {
  throw new Error("ex6: withTimeout() is not implemented yet - edit this file.");
}
