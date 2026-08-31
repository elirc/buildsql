// d23_realworld_apis / ex7 - a route that types its own params.
// See lessons/d23_realworld_apis/README.md, "ex7".
//
// The stub types the params as a bag of strings, so the handler
// learns nothing from the path, and run() throws.

export type PathParams<P extends string> = Record<string, string>;

export interface Route<P extends string, R> {
  path: P;
  run(url: string): R | undefined;
}

export function defineRoute<P extends string, R>(
  path: P,
  handler: (params: PathParams<P>) => R,
): Route<P, R> {
  throw new Error("ex7: defineRoute() is not implemented yet - edit this file.");
}
