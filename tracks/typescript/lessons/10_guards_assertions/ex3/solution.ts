// 10_guards_assertions / ex3 - unknown is the honest type for outside data.
// See lessons/10_guards_assertions/README.md, "Exercise 3".
//
// JSON.parse is typed `any`, which is a hole in the type system that this
// function currently hands straight to its callers.

export function parseJson(text: string): any {
  throw new Error("ex3: parseJson() is not implemented yet - edit this file.");
}

export function readTitle(value: unknown): string | null {
  throw new Error("ex3: readTitle() is not implemented yet - edit this file.");
}
