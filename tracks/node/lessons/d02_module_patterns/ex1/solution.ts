// d02_module_patterns / ex1 - the lazy singleton.
// See lessons/d02_module_patterns/README.md, "Problem 1".

/**
 * Wrap a factory so it runs at most once. Later calls return the first value.
 * A factory that throws is not remembered: the next call tries again.
 */
export function once<T>(factory: () => T): () => T {
  throw new Error("ex1: once() is not implemented yet - edit this file.");
}
