// d23_realworld_apis / ex6 - the method decides the arity.
// See lessons/d23_realworld_apis/README.md, "ex6".
//
// The stub takes an optional body, so both wrong call shapes
// compile and the method proves nothing.

export type Method = "GET" | "POST";

export function describeRequest<M extends Method>(
  method: M,
  url: string,
  body?: string,
): string {
  throw new Error("ex6: describeRequest() is not implemented yet - edit this file.");
}
