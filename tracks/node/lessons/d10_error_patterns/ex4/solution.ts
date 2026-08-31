// d10_error_patterns / ex4 - reading a cause chain.
// See lessons/d10_error_patterns/README.md, "Problem 4".

export interface Explanation {
  /** messages, outermost first */
  chain: string[];
  /** the last error reached */
  root: Error;
  /** how many links the chain has */
  depth: number;
}

/**
 * Walk `cause` while it holds an Error. A cause that is anything else is data,
 * and the walk stops there. A chain that loops back on itself stops at the
 * repeat rather than spinning.
 */
export function explain(error: Error): Explanation {
  throw new Error("ex4: explain() is not implemented yet - edit this file.");
}
