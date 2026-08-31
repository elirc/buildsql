## Hint 1

Closure over one collection, four methods returned in an object literal. The
only real decision is what the collection is — and a plain object brings
inherited keys with it, so `has("toString")` answers `true` on an empty
registry unless you are careful.

## Hint 2

Both error paths are the same shape: check membership, throw a `new Error` with
a template string that includes the name, otherwise proceed. Write the messages
exactly as the gate quotes them.

`names()` returns a **new sorted array** every call. Handing out the live key
list would let a caller sort it, splice it, or hold it and be surprised later —
a registry that leaks its internals is not a registry.
