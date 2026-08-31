// d02_functions_signatures / ex8 - a middleware type with a `next` parameter.
// See lessons/d02_functions_signatures/README.md, "ex8".
//
// The shipped Middleware is a plain transform: it can change the value on the
// way in and has no way to do anything on the way out.

export type Middleware = (input: string) => string;

export function runMiddleware(input: string, middleware: readonly Middleware[]): string {
  throw new Error("ex8: runMiddleware() is not implemented yet - edit this file.");
}
