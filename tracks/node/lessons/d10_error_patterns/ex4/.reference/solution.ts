// d10_error_patterns / ex4 - reference solution (author only, used by `dojo verify`).

export interface Explanation {
  chain: string[];
  root: Error;
  depth: number;
}

export function explain(error: Error): Explanation {
  const chain: string[] = [];
  // Identity, not messages: two different errors are allowed to say the same
  // thing, and a Set of objects is what makes the loop guard exact.
  const seen = new Set<Error>();

  let current: Error = error;
  for (;;) {
    seen.add(current);
    chain.push(current.message);

    const cause = (current as Error & { cause?: unknown }).cause;
    // Only an Error is another link. Anything else is a payload.
    if (!(cause instanceof Error) || seen.has(cause)) break;
    current = cause;
  }

  return { chain, root: current, depth: chain.length };
}
