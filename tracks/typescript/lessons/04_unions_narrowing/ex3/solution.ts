// 04_unions_narrowing / ex3 - narrowing things that have no discriminant.
// See lessons/04_unions_narrowing/README.md, "Exercise 3".
//
// Failure currently has one member. The gate passes three kinds of value.

export type Failure = Error;

export function explainFailure(failure: Failure): string {
  throw new Error("ex3: explainFailure() is not implemented yet - edit this file.");
}
