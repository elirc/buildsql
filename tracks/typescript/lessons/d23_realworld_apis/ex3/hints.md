## Hint 1

Sorting makes the output stable, which is what lets a cache key or a test
compare two query strings for equality. `Object.keys` has no guaranteed order
for you to rely on instead.

## Hint 2

Skip on `=== undefined`, not on falsiness: `0`, `""` and `false` all have to
survive, and the gate checks two of the three.

`encodeURIComponent` is the right encoder for a single component; it escapes
`&` and `=`, which is exactly why it goes around each key and each value
separately rather than around the joined result.

Left to you: what an array value should do. The prompt does not allow one -
decide what you would want (`a=1&a=2`, or `a=1,2`) before someone widens the
parameter type for you.
