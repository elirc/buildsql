// d10_error_patterns / ex7 - the leaves of a failure tree.
// See lessons/d10_error_patterns/README.md, "Problem 7".

/**
 * Collect the errors at the bottom of a failure tree.
 *
 * Two kinds of link go downwards: an `AggregateError`s `errors` array, and any
 * `cause` that is itself an Error. An error with no unvisited links below it is
 * a leaf. Leaves come back in first-seen order, without duplicates, and a
 * cycle must terminate. Anything that is not an Error has no leaves.
 */
export function flattenErrors(error: unknown): Error[] {
  throw new Error("ex7: flattenErrors() is not implemented yet - edit this file.");
}
