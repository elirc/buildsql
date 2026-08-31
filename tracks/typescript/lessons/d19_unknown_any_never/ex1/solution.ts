// d19_unknown_any_never / ex1 - parse into unknown.
// See lessons/d19_unknown_any_never/README.md, "ex1".
//
// The stub returns any, which is exactly the leak this exercise
// exists to plug - and it throws, so the runtime gate is unhappy too.

export function parseJson(text: string): any {
  throw new Error("ex1: parseJson() is not implemented yet - edit this file.");
}
