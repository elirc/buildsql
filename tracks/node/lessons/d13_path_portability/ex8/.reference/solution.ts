// d13_path_portability / ex8 - reference solution (author only, used by `dojo verify`).

/** The last `take` segments of a path, as a string. */
function suffixOf(segments: string[], take: number): string {
  return segments.slice(Math.max(0, segments.length - take)).join("/");
}

export function shortestUniqueLabels(paths: string[]): Record<string, string> {
  const segments = paths.map((entry) => entry.split("/").filter((part) => part !== ""));
  const labels: Record<string, string> = {};

  paths.forEach((entry, index) => {
    const own = segments[index];
    for (let take = 1; take <= own.length; take += 1) {
      const candidate = suffixOf(own, take);
      // A shorter path can only clash by being entirely equal to the suffix,
      // which Math.max() in suffixOf() takes care of.
      const clashes = segments.some(
        (other, otherIndex) => otherIndex !== index && suffixOf(other, take) === candidate,
      );
      if (!clashes) {
        labels[entry] = candidate;
        return;
      }
    }
    labels[entry] = own.join("/");
  });

  return labels;
}
