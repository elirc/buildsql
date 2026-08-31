## Hint 1

The returned function must be `(arg: A) => R` - the same signature that came in.
A wrapper that widens the result makes every call site pay for it.

The cache lives in `memoize`'s body, so each wrapped function gets its own.

## Hint 2

`cache.get(key) ?? fn(arg)` looks right and recomputes forever whenever the
memoised value is `undefined`, `0`, `""` or `false`. The gate memoises a function
that always returns `undefined` for exactly that reason.

Ask the cache whether it **has** the key, then read it.

Left to you: `has` then `get` (two lookups), or `get` first and `has` only when
the value is `undefined` (one lookup in the common case). Say which you would
ship and why.
