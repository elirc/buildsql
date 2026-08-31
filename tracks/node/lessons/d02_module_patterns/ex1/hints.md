## Hint 1

`once` builds nothing itself — it returns a closure over two variables that
outlive each call. Sketch those two variables before you write the body, and
ask what each one is for.

## Hint 2

The tempting single variable is the cached value, tested with
`if (value === undefined)`. The gate has a factory that returns `undefined` on
purpose, because that shortcut re-runs it forever.

The other half is the ordering inside the `if`: the line that records "we have
run" has to sit somewhere relative to the line that calls the factory, and only
one of the two placements lets a throwing factory be retried.
