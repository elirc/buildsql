## Hint 1

Two edits, and the small one is the important one. `assertNever` takes
`unknown` today, which means it accepts anything and proves nothing. Change its
parameter to the type that has no values at all, and it becomes a compile-time
assertion instead of a runtime one.

Then write `area` with a `default` branch that calls it.

## Hint 2

`never` is the empty type: no value is a `never`, so nothing can be passed to a
function expecting one. Inside an exhaustive `switch`, though, the `default`
branch is reached only when every variant has been handled - and there
TypeScript has narrowed the value to `never`, so the call compiles.

Handle one variant and leave the others out, and the same call stops compiling
with a message naming the type you forgot. That error is the feature.

## Hint 3

Change the signature to `assertNever(value: never): never`, leave the body
alone, and write `area` as a `switch (shape.kind)` with the three area formulas
plus `default: return assertNever(shape);`.

The decision left to you: whether `default` returns the call or just calls it.
Both compile. One of them makes TypeScript agree that `area` always returns a
number without any further help - try it the other way and read what it says.
