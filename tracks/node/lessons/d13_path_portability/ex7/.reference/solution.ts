// d13_path_portability / ex7 - reference solution (author only, used by `dojo verify`).

/** One segment of a pattern, as a regular expression anchored at both ends. */
function segmentMatcher(segment: string): RegExp {
  const escaped = segment
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    // ...and then put the wildcard back, as "anything but a separator".
    .replace(/\\\*/g, "[^/]*");
  return new RegExp(`^${escaped}$`);
}

export function matchesGlob(pattern: string, filePath: string): boolean {
  const patternParts = pattern.split("/").filter((part) => part !== "");
  const fileParts = filePath.split("/").filter((part) => part !== "");

  const match = (p: number, f: number): boolean => {
    if (p === patternParts.length) return f === fileParts.length;

    if (patternParts[p] === "**") {
      // Zero segments first, then one, then two... every split has to be tried,
      // which is why this is a search and not a single regular expression.
      for (let take = f; take <= fileParts.length; take += 1) {
        if (match(p + 1, take)) return true;
      }
      return false;
    }

    if (f === fileParts.length) return false;
    return segmentMatcher(patternParts[p]).test(fileParts[f]) && match(p + 1, f + 1);
  };

  return match(0, 0);
}
