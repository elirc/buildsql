## Hint 1

The return type is a tuple of exactly two arrays, and the labels are free
documentation: `[kept: T[], dropped: T[]]`. They are erased at runtime and
appear in every editor tooltip.

## Hint 2

Declare both arrays before the loop and push into one or the other. That is the
single pass the prompt asks for - and it means the predicate runs exactly once
per element, which matters the moment somebody passes one that counts, logs or
hits a cache.

Left to you: one loop, or two `filter` calls with a negated predicate. Have the
"how many times does the predicate run" answer ready.
