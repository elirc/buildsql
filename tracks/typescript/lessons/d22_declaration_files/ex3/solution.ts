// d22_declaration_files / ex3 - add something to globalThis.
// See lessons/d22_declaration_files/README.md, "ex3".
//
// The stub declares no global at all, so globalThis has no such
// member and neither function can reach one.

export function registerBuild(name: string, version: number): void {
  throw new Error("ex3: registerBuild() is not implemented yet - edit this file.");
}

export function readBuild(name: string): number | undefined {
  throw new Error("ex3: readBuild() is not implemented yet - edit this file.");
}
