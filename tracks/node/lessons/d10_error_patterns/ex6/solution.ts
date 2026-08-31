// d10_error_patterns / ex6 - catch narrowly.
// See lessons/d10_error_patterns/README.md, "Problem 6".

export interface SwallowOptions<R> {
  /** always handed a real Error, whatever was thrown */
  when: (error: Error) => boolean;
  fallback: R;
}

/**
 * Run `fn`. A rejection the predicate accepts becomes `fallback`; anything
 * else is rethrown EXACTLY as it was thrown - same object, same stack.
 */
export async function swallow<R>(
  fn: () => Promise<R>,
  options: SwallowOptions<R>,
): Promise<R> {
  throw new Error("ex6: swallow() is not implemented yet - edit this file.");
}
