// d10_error_patterns / ex6 - reference solution (author only, used by `dojo verify`).

export interface SwallowOptions<R> {
  when: (error: Error) => boolean;
  fallback: R;
}

function asError(thrown: unknown): Error {
  return thrown instanceof Error ? thrown : new Error(String(thrown), { cause: thrown });
}

export async function swallow<R>(
  fn: () => Promise<R>,
  options: SwallowOptions<R>,
): Promise<R> {
  try {
    return await fn();
  } catch (error) {
    // Normalised for the PREDICATE, so it can read .message without checking
    // the type - but the original is what gets rethrown, because that is the
    // object with the real stack on it.
    if (options.when(asError(error))) return options.fallback;
    throw error;
  }
}
