## Hint 1

The predicate is on the *second* parameter: `value is T`. `T` is inferred from
the list, which is why the list needs `as const` at the call site for the
narrowing to be worth anything.

## Hint 2

`allowed.includes(value)` will not typecheck as written: `includes` wants a `T`
and you are handing it a `string`. Widening the array to `readonly string[]`
for the call is the usual fix and is honest - you are asking a question about
strings.

Left to you: widening the array or using `some`. Both compile without an
assertion on `value`, which is the property worth protecting.
