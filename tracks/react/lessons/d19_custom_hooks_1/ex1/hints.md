## Hint 1

Everything the hook computes is already right. What is wrong is that `next` and
`prev` are built again from scratch on every render, so no two renders hand back
the same function object.

## Hint 2

`useCallback(fn, deps)` returns the same function until one of its dependencies
changes. Look at what each of these two actually reads: because they use the
updater form of `setIndex`, neither needs the current index, and one of them
needs nothing at all.
