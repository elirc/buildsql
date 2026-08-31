## Hint 1

The generic belongs on `get`, not on `createCache`: one cache holds many kinds
of value, and the type is decided per read by the guard the caller supplies.

## Hint 2

Inside, a `Map<string, unknown>` is the whole storage. Ask `has` before `get`
so that a stored `undefined` is not confused with an absent key - the same
distinction d09's `memoize` turned on.

Left to you: whether a failed guard should return `null` or throw. The prompt
picks `null`; a cache that throws on a stale entry is a defensible design and a
different function.
