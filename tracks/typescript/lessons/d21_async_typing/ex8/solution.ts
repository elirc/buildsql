// d21_async_typing / ex8 - a tuple-shaped Promise.all.
// See lessons/d21_async_typing/README.md, "ex8".
//
// The stub has an ordinary type parameter and promises
// unknown[], so the positions and their types are lost on the way in and out.

export function allOf<T extends readonly unknown[]>(values: T): Promise<unknown[]> {
  throw new Error("ex8: allOf() is not implemented yet - edit this file.");
}
