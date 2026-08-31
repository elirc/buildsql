// d24_mixed_gauntlet / ex6 - async plus generics.
// See lessons/d24_mixed_gauntlet/README.md, "ex6".
//
// The stub promises unknown and throws, so it neither tries the
// tasks nor keeps their type.

export async function firstSuccess<T>(
  tasks: readonly (() => Promise<T>)[],
): Promise<unknown> {
  throw new Error("ex6: firstSuccess() is not implemented yet - edit this file.");
}
