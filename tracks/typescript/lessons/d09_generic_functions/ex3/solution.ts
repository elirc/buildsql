// d09_generic_functions / ex3 - three type parameters.
// See lessons/d09_generic_functions/README.md, "ex3".
//
// There are only two here, and the combiner is allowed to return anything.
// The third parameter is what carries its result out.

export function zipWith<A, B>(
  a: readonly A[],
  b: readonly B[],
  combine: (a: A, b: B) => unknown,
): unknown[] {
  throw new Error("ex3: zipWith() is not implemented yet - edit this file.");
}
