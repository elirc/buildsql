// d22_declaration_files / ex5 - one interface, two declarations.
// See lessons/d22_declaration_files/README.md, "ex5".
//
// The stub declares the interface once and throws, so the second
// half of the shape does not exist.

export interface RequestContext {
  requestId: string;
}

export function describeContext(context: RequestContext): string {
  throw new Error("ex5: describeContext() is not implemented yet - edit this file.");
}
