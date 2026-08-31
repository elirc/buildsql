// d10_error_patterns / ex7 - reference solution (author only, used by `dojo verify`).

function linksBelow(error: Error): Error[] {
  const links: Error[] = [];

  if (error instanceof AggregateError && Array.isArray(error.errors)) {
    for (const entry of error.errors as unknown[]) {
      if (entry instanceof Error) links.push(entry);
    }
  }

  const cause = (error as Error & { cause?: unknown }).cause;
  if (cause instanceof Error) links.push(cause);

  return links;
}

export function flattenErrors(error: unknown): Error[] {
  if (!(error instanceof Error)) return [];

  const leaves: Error[] = [];
  const seen = new Set<Error>();

  const visit = (current: Error): void => {
    if (seen.has(current)) return;
    seen.add(current);

    // Filtering out what is already visited is what makes a cycle terminate:
    // an error whose only link points back up the tree has nothing new below
    // it, so it is the bottom.
    const unvisited = linksBelow(current).filter((link) => !seen.has(link));
    if (unvisited.length === 0) {
      leaves.push(current);
      return;
    }
    for (const link of unvisited) visit(link);
  };

  visit(error);
  return leaves;
}
