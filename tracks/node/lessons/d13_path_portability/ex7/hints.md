## Hint 1

Split both sides on `/` and match segment against segment. The whole difficulty
is that `**` does not consume one segment — it consumes an unknown number of
them, so this is a search with backtracking, not a walk with two cursors.

## Hint 2

Write it as a recursive `match(patternIndex, fileIndex)`:

- pattern exhausted → true only if the file is exhausted too;
- pattern segment is `**` → try every number of file segments it could swallow,
  **starting at zero**, and succeed if any of them lets the rest match;
- otherwise → the segment has to match this one file segment, and then recurse
  on the pair after it.

## Hint 3

A `*` inside a segment is a small regular expression: escape everything that is
special, then turn the escaped `\*` back into `[^/]*`. The `[^/]` is the part
that matters — a `.*` there would let `*.md` match `docs/readme.md`, and an
ignore rule written like that silently swallows your whole tree.

The remaining decision is what a pattern like `a**b` inside one segment should
mean. The gate does not ask; a reviewer might.
